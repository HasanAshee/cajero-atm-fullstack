import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { Transaction } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class ReceiptPdfService {

  private readonly COLORS = {
    bg: '#0a0a0a',
    elevated: '#1a1a1a',
    border: '#2a2a2a',
    textPrimary: '#f5f5f5',
    textSecondary: '#a3a3a3',
    gold: '#d4af37',
    cream: '#e8dcc4',
    green: '#10b981',
    red: '#ef4444'
  };

  generateReceipt(tx: Transaction, accountUser: string): void {
    const doc = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    });

    const pageWidth = doc.internal.pageSize.getWidth();   // 210
    const pageHeight = doc.internal.pageSize.getHeight(); // 297

    doc.setFillColor(this.COLORS.bg);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // ───── Header ─────
    doc.setFillColor(this.COLORS.elevated);
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setDrawColor(this.COLORS.gold);
    doc.setLineWidth(0.5);
    doc.line(0, 40, pageWidth, 40);

    doc.setTextColor(this.COLORS.gold);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('M.H.M. BANK', 20, 22);

    doc.setTextColor(this.COLORS.textSecondary);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Comprobante de operación', 20, 30);

    const issuedAt = new Date().toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    doc.setFontSize(8);
    doc.text(`Emitido: ${issuedAt}`, pageWidth - 20, 30, { align: 'right' });

    // ───── Hero ─────
    let y = 60;

    doc.setTextColor(this.COLORS.textSecondary);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(tx.type.toUpperCase(), pageWidth / 2, y, { align: 'center' });

    y += 14;

    const sign = this.signFor(tx.type);
    const amountColor = sign === '+' ? this.COLORS.green : this.COLORS.red;
    doc.setTextColor(amountColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(32);
    const formattedAmount = `${sign} $ ${tx.amount.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
    doc.text(formattedAmount, pageWidth / 2, y, { align: 'center' });

    y += 14;
    doc.setDrawColor(this.COLORS.gold);
    doc.setLineWidth(0.3);
    doc.line(80, y, pageWidth - 80, y);

    // ───── Detalles ─────
    y += 18;

    const leftX = 25;
    const rightX = pageWidth - 25;
    const rowGap = 12;

    this.drawRow(doc, 'Titular', `@${accountUser}`, leftX, rightX, y, this.COLORS.cream);
    y += rowGap;

    const txDate = new Date(tx.date).toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    this.drawRow(doc, 'Fecha y hora', txDate, leftX, rightX, y);
    y += rowGap;

    if (tx.counterpartyUsername) {
      const label = tx.type === 'Transferencia enviada' ? 'Destinatario' : 'Remitente';
      this.drawRow(doc, label, `@${tx.counterpartyUsername}`, leftX, rightX, y, this.COLORS.cream);
      y += rowGap;
    }

    if (tx.description) {
      this.drawRow(doc, 'Descripción', tx.description, leftX, rightX, y);
      y += rowGap;
    }

    const opNumber = this.shortId(tx._id);
    this.drawRow(doc, 'N° de operación', opNumber, leftX, rightX, y, this.COLORS.gold, true);
    y += rowGap;

    // ───── Footer ─────
    const footerY = pageHeight - 25;

    doc.setDrawColor(this.COLORS.gold);
    doc.setLineWidth(0.3);
    doc.line(20, footerY - 8, pageWidth - 20, footerY - 8);

    doc.setTextColor(this.COLORS.textSecondary);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(
      'Este comprobante es válido como constancia de la operación realizada.',
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );
    doc.setTextColor(this.COLORS.gold);
    doc.setFontSize(7);
    doc.text(
      'M.H.M. Bank — Banca digital',
      pageWidth / 2,
      footerY + 5,
      { align: 'center' }
    );

    // ───── save ─────
    const fileName = `MHM-Bank-comprobante-${opNumber}.pdf`;
    doc.save(fileName);
  }

  // ─── Helpers ───

  private drawRow(
    doc: jsPDF,
    label: string,
    value: string,
    leftX: number,
    rightX: number,
    y: number,
    valueColor: string = this.COLORS.textPrimary,
    mono: boolean = false
  ): void {
    // Label
    doc.setTextColor(this.COLORS.textSecondary);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(label.toUpperCase(), leftX, y);

    // Value 
    doc.setTextColor(valueColor);
    doc.setFont(mono ? 'courier' : 'helvetica', mono ? 'normal' : 'normal');
    doc.setFontSize(11);
    doc.text(value, rightX, y, { align: 'right' });
  }

  private signFor(type: Transaction['type']): '+' | '-' {
    return type === 'Depósito' || type === 'Transferencia recibida' ? '+' : '-';
  }

  private shortId(id?: string): string {
    if (!id) return '—';
    return id.slice(-12).toUpperCase();
  }
}