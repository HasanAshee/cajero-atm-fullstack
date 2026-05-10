import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject,
  viewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  Chart,
  ChartConfiguration,
  registerables
} from 'chart.js';
import { AccountService } from '../../services/account.service';
import { Transaction } from '../../models/account.model';
import { MainLayoutComponent } from '../main-layout/main-layout.component';

Chart.register(...registerables);

type Period = 'week' | 'month' | 'quarter' | 'year';

@Component({
  selector: 'app-stats-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stats-page.component.html',
  styleUrl: './stats-page.component.css'
})
export class StatsPageComponent implements OnInit, OnDestroy {
  private accountService = inject(AccountService);
  private balanceChangedSub?: Subscription;

  balanceChartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('balanceChart');
  donutChartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('donutChart');
  barChartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('barChart');

  private balanceChart?: Chart;
  private donutChart?: Chart;
  private barChart?: Chart;

  // Estado
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  allTransactions = signal<Transaction[]>([]);
  currentBalance = signal(0);
  period = signal<Period>('month');

  setPeriod(value: Period): void {
    this.period.set(value);
    setTimeout(() => this.renderCharts(), 0);
  }

  filteredTransactions = computed(() => {
    const txs = this.allTransactions();
    const cutoff = this.getPeriodCutoff(this.period());
    return txs.filter((tx) => new Date(tx.date) >= cutoff);
  });

  totalIncome = computed(() =>
    this.filteredTransactions()
      .filter((t) => t.type === 'Depósito' || t.type === 'Transferencia recibida')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  totalExpenses = computed(() =>
    this.filteredTransactions()
      .filter((t) => t.type === 'Retiro' || t.type === 'Transferencia enviada')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  netFlow = computed(() => this.totalIncome() - this.totalExpenses());

  transactionCount = computed(() => this.filteredTransactions().length);

  periodOptions: { value: Period; label: string }[] = [
    { value: 'week', label: 'Última semana' },
    { value: 'month', label: 'Último mes' },
    { value: 'quarter', label: 'Últimos 3 meses' },
    { value: 'year', label: 'Último año' }
  ];

  ngOnInit(): void {
    this.loadData();

    this.balanceChangedSub = MainLayoutComponent.balanceChanged$.subscribe(() => {
      this.loadData();
    });
  }

  ngOnDestroy(): void {
    this.balanceChangedSub?.unsubscribe();
    this.balanceChart?.destroy();
    this.donutChart?.destroy();
    this.barChart?.destroy();
  }
  
  loadData(): void {
    console.log('[STATS] loadData() iniciado');
    this.loading.set(true);
    this.errorMessage.set(null);

    let pending = 2;
    const tryFinish = () => {
      pending--;
      console.log('[STATS] tryFinish, pending:', pending);
      if (pending === 0) {
        this.loading.set(false);
        console.log('[STATS] loading set to false, calling renderCharts in 0ms');
        setTimeout(() => {
          console.log('[STATS] setTimeout disparado, llamando renderCharts');
          this.renderCharts();
        }, 0);
      }
    };

    this.accountService.getMe().subscribe({
      next: (info) => {
        console.log('[STATS] getMe OK', info);
        this.currentBalance.set(info.balance);
        tryFinish();
      },
      error: (err) => {
        console.error('[STATS] getMe ERROR', err);
        this.errorMessage.set('No pudimos cargar tus datos.');
        tryFinish();
      }
    });

    this.accountService.getTransactions().subscribe({
      next: (txs) => {
        console.log('[STATS] getTransactions OK, count:', txs.length);
        const sorted = [...txs].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        this.allTransactions.set(sorted);
        tryFinish();
      },
      error: (err) => {
        console.error('[STATS] getTransactions ERROR', err);
        tryFinish();
      }
    });
  }

  private renderCharts(): void {
    console.log('[STATS] renderCharts() llamado');
    
    const tryRender = (attempts = 0) => {
      const balance = this.balanceChartCanvas();
      const donut = this.donutChartCanvas();
      const bar = this.barChartCanvas();
      
      if (balance && donut && bar) {
        console.log('[STATS] Canvases listos, renderizando');
        this.renderBalanceChart();
        this.renderDonutChart();
        this.renderBarChart();
        return;
      }
      
      if (attempts > 20) {
        console.warn('[STATS] Timeout esperando canvases');
        return;
      }
      
      requestAnimationFrame(() => tryRender(attempts + 1));
    };
    
    tryRender();
  }

  private renderBalanceChart(): void {
    const canvas = this.balanceChartCanvas()?.nativeElement;
    if (!canvas) return;

    this.balanceChart?.destroy();

    const data = this.computeBalanceEvolution();

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Balance',
            data: data.values,
            borderColor: '#d4af37',
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.3,
            pointRadius: 3,
            pointBackgroundColor: '#d4af37',
            pointBorderColor: '#0a0a0a',
            pointBorderWidth: 2,
            pointHoverRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1a1a',
            borderColor: '#2a2a2a',
            borderWidth: 1,
            titleColor: '#f5f5f5',
            bodyColor: '#e8dcc4',
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: (ctx) => `$ ${(ctx.raw as number).toFixed(2)}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: '#242424' },
            ticks: { color: '#6b6b6b', font: { size: 11 } }
          },
          y: {
            grid: { color: '#242424' },
            ticks: {
              color: '#6b6b6b',
              font: { size: 11 },
              callback: (val) => `$${val}`
            }
          }
        }
      }
    };

    this.balanceChart = new Chart(canvas, config);
  }

  private renderDonutChart(): void {
    const canvas = this.donutChartCanvas()?.nativeElement;
    if (!canvas) return;

    this.donutChart?.destroy();

    const expenses = this.filteredTransactions().filter(
      (t) => t.type === 'Retiro' || t.type === 'Transferencia enviada'
    );

    const retiros = expenses
      .filter((t) => t.type === 'Retiro')
      .reduce((sum, t) => sum + t.amount, 0);
    const transferenciasEnviadas = expenses
      .filter((t) => t.type === 'Transferencia enviada')
      .reduce((sum, t) => sum + t.amount, 0);

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['Retiros', 'Transferencias enviadas'],
        datasets: [
          {
            data: [retiros, transferenciasEnviadas],
            backgroundColor: ['#ef4444', '#d4af37'],
            borderColor: '#1a1a1a',
            borderWidth: 3,
            hoverOffset: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#a3a3a3',
              font: { size: 12 },
              padding: 16,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: '#1a1a1a',
            borderColor: '#2a2a2a',
            borderWidth: 1,
            titleColor: '#f5f5f5',
            bodyColor: '#e8dcc4',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => `$ ${(ctx.raw as number).toFixed(2)}`
            }
          }
        }
      }
    };

    this.donutChart = new Chart(canvas, config);
  }

  private renderBarChart(): void {
    const canvas = this.barChartCanvas()?.nativeElement;
    if (!canvas) return;

    this.barChart?.destroy();

    const data = this.computeWeeklyComparison();

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Ingresos',
            data: data.income,
            backgroundColor: '#10b981',
            borderRadius: 6,
            barPercentage: 0.7
          },
          {
            label: 'Egresos',
            data: data.expenses,
            backgroundColor: '#ef4444',
            borderRadius: 6,
            barPercentage: 0.7
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#a3a3a3',
              font: { size: 12 },
              padding: 16,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: '#1a1a1a',
            borderColor: '#2a2a2a',
            borderWidth: 1,
            titleColor: '#f5f5f5',
            bodyColor: '#e8dcc4',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: $ ${(ctx.raw as number).toFixed(2)}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#6b6b6b', font: { size: 11 } }
          },
          y: {
            grid: { color: '#242424' },
            ticks: {
              color: '#6b6b6b',
              font: { size: 11 },
              callback: (val) => `$${val}`
            }
          }
        }
      }
    };

    this.barChart = new Chart(canvas, config);
  }


  private computeBalanceEvolution(): { labels: string[]; values: number[] } {
    const txs = this.filteredTransactions();
    if (txs.length === 0) {
      return { labels: ['Sin datos'], values: [this.currentBalance()] };
    }

    const sortedDesc = [...txs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let runningBalance = this.currentBalance();
    const points: { date: Date; balance: number }[] = [
      { date: new Date(), balance: runningBalance }
    ];

    for (const tx of sortedDesc) {
      if (tx.type === 'Depósito' || tx.type === 'Transferencia recibida') {
        runningBalance -= tx.amount;
      } else {
        runningBalance += tx.amount;
      }
      points.unshift({ date: new Date(tx.date), balance: runningBalance });
    }

    return {
      labels: points.map((p) =>
        p.date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
      ),
      values: points.map((p) => p.balance)
    };
  }

  private computeWeeklyComparison(): {
    labels: string[];
    income: number[];
    expenses: number[];
  } {
    const txs = this.filteredTransactions();
    if (txs.length === 0) {
      return { labels: ['Sin datos'], income: [0], expenses: [0] };
    }

    const weekMap = new Map<string, { income: number; expenses: number }>();

    for (const tx of txs) {
      const date = new Date(tx.date);
      const weekStart = this.getWeekStart(date);
      const key = weekStart.toISOString().split('T')[0];

      if (!weekMap.has(key)) {
        weekMap.set(key, { income: 0, expenses: 0 });
      }
      const bucket = weekMap.get(key)!;

      if (tx.type === 'Depósito' || tx.type === 'Transferencia recibida') {
        bucket.income += tx.amount;
      } else {
        bucket.expenses += tx.amount;
      }
    }

    const sortedKeys = Array.from(weekMap.keys()).sort();
    const labels = sortedKeys.map((key) => {
      const date = new Date(key);
      return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
    });

    return {
      labels,
      income: sortedKeys.map((k) => weekMap.get(k)!.income),
      expenses: sortedKeys.map((k) => weekMap.get(k)!.expenses)
    };
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // lunes como inicio
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getPeriodCutoff(period: Period): Date {
    const now = new Date();
    const cutoff = new Date(now);
    switch (period) {
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoff.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
    }
    return cutoff;
  }
}