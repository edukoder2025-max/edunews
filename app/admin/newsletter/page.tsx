'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Send, Eye, Sparkles, AlertTriangle, Users, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminNewsletter() {
  const [subscribersCount, setSubscribersCount] = useState<number | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSendingCampaign, setIsSendingCampaign] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [previewData, setPreviewData] = useState<{ subject: string; html: string } | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [newsletterType, setNewsletterType] = useState<'daily' | 'plus' | 'premium'>('daily');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch('/api/newsletter/stats');
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscribersCount(data.count);
      } else {
        console.error('Error fetching subscriber stats:', data.error);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleGeneratePreview = async () => {
    setIsGenerating(true);
    setNotification(null);
    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsletterType }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPreviewData({
          subject: data.subject,
          html: data.html
        });
        setNotification({ type: 'success', message: '¡Boletín generado e incorporado a la previsualización!' });
      } else {
        setNotification({ type: 'error', message: data.error || 'No se pudo generar la previsualización.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Error de red al compilar el boletín.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail || !previewData) return;

    setIsSendingTest(true);
    setNotification(null);
    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          previewEmail: testEmail,
          newsletterType,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({ type: 'success', message: `Correo de prueba enviado con éxito a ${testEmail}.` });
      } else {
        setNotification({ type: 'error', message: data.error || 'No se pudo enviar el correo de prueba.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Error al conectar con la API de envío de prueba.' });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!previewData) return;
    const listDescription = newsletterType === 'daily' 
      ? 'Boletín Diario (Lista General)' 
      : newsletterType === 'plus' 
        ? 'Boletín Plus (Lista Plan Plus)' 
        : 'Boletín Premium (Lista Premium Lifetime)';
    if (!confirm(`¿Estás seguro de que deseas enviar este boletín "${listDescription}" a sus respectivos suscriptores en Brevo? Esta acción no se puede deshacer.`)) {
      return;
    }

    setIsSendingCampaign(true);
    setNotification(null);
    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sendToAll: true,
          newsletterType,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotification({ type: 'success', message: `¡Campaña enviada con éxito! ID de Campaña Brevo: ${data.campaignId}` });
        fetchStats(); // Actualizar estadísticas
      } else {
        setNotification({ type: 'error', message: data.error || 'Error al lanzar la campaña masiva.' });
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Error crítico al lanzar la campaña en Brevo.' });
    } finally {
      setIsSendingCampaign(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-slate-300">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/5 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-black tracking-widest uppercase">
              Panel Administrativo
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-serif italic text-white mt-2">
            Marketing & Newsletter
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestioná tus suscriptores de Brevo y compilá boletines automatizados con Inteligencia Artificial.
          </p>
        </div>

        <Link 
          href="/" 
          className="px-4 py-2 border border-white/10 hover:border-white/20 text-xs font-bold uppercase rounded-xl transition-all"
        >
          Volver al Portal
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Subscriber Card */}
        <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-6 flex items-center justify-between shadow-xl">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Suscriptores (Brevo)</p>
            {isLoadingStats ? (
              <Loader2 className="animate-spin text-slate-500 h-6 w-6 mt-1" />
            ) : (
              <h2 className="text-3xl font-black text-white">
                {subscribersCount !== null ? subscribersCount : 'Error'}
              </h2>
            )}
          </div>
          <div className="p-4 bg-primary/10 border border-primary/20 text-primary rounded-xl">
            <Users size={24} />
          </div>
        </div>

        {/* Integration Status Card */}
        <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-6 flex items-center justify-between shadow-xl">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Estado de Brevo</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-2.5 w-2.5 rounded-full bg-secondary animate-pulse"></span>
              <h2 className="text-lg font-black text-white">Conectado</h2>
            </div>
          </div>
          <div className="p-4 bg-secondary/10 border border-secondary/20 text-secondary rounded-xl">
            <CheckCircle size={24} />
          </div>
        </div>

        {/* Action Panel Quick Stats */}
        <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-6 flex items-center justify-between shadow-xl">
          <div className="space-y-1 w-full">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Acción Rápida</p>
            <button
              onClick={fetchStats}
              disabled={isLoadingStats}
              className="mt-1 flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={isLoadingStats ? 'animate-spin' : ''} />
              Refrescar Datos
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`p-4 rounded-xl mb-8 flex items-center gap-3 text-sm font-bold border ${
          notification.type === 'success' 
            ? 'bg-secondary/10 border-secondary/20 text-secondary' 
            : 'bg-primary/10 border-primary/20 text-primary'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Administrative Action Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Actions panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-6 space-y-6 shadow-xl">
            <h3 className="text-base font-black uppercase tracking-wider text-white border-b border-white/5 pb-3">
              Herramientas de Campaña
            </h3>

            {/* Step 1: Generate */}
            <div className="space-y-4">
              <span className="text-[9px] bg-slate-900 text-primary border border-primary/10 px-2 py-0.5 rounded font-black tracking-widest uppercase">
                Paso 1
              </span>
              <h4 className="text-sm font-bold text-white leading-snug">Configurar Boletín con IA</h4>
              
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Tipo de Boletín</label>
                <select
                  value={newsletterType}
                  onChange={(e) => {
                    setNewsletterType(e.target.value as any);
                    setPreviewData(null); // Reset preview on change
                  }}
                  className="w-full h-10 px-3 bg-slate-900 border border-white/10 text-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50"
                >
                  <option value="daily">Boletín Diario (General)</option>
                  <option value="plus">Boletín Plus Semanal (Paid)</option>
                  <option value="premium">Boletín Premium Lifetime (Paid)</option>
                </select>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                El sistema recopilará las últimas 5 noticias y compilará la plantilla especial {newsletterType === 'daily' ? 'Diaria' : newsletterType === 'plus' ? 'Plus (Cian)' : 'Premium (Dorado)'} usando Gemini.
              </p>
              <button
                onClick={handleGeneratePreview}
                disabled={isGenerating || isSendingCampaign}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Compilando Digest...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-secondary animate-pulse" />
                    Compilar Boletín
                  </>
                )}
              </button>
            </div>

            {/* Step 2: Test Preview */}
            {previewData && (
              <div className="space-y-3 pt-6 border-t border-white/5">
                <span className="text-[9px] bg-slate-900 text-secondary border border-secondary/10 px-2 py-0.5 rounded font-black tracking-widest uppercase">
                  Paso 2
                </span>
                <h4 className="text-sm font-bold text-white leading-snug">Enviar Email de Prueba</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Recibí una previsualización en tu casilla antes del envío masivo.
                </p>
                <form onSubmit={handleSendTest} className="space-y-2">
                  <input
                    type="email"
                    placeholder="ejemplo@gmail.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    required
                    className="w-full h-10 px-3 bg-slate-900 border border-white/10 focus:border-primary/50 text-slate-100 placeholder-slate-500 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                  <button
                    type="submit"
                    disabled={isSendingTest || isSendingCampaign}
                    className="w-full h-10 border border-white/10 hover:border-white/20 hover:bg-white/5 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSendingTest ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Send size={12} />
                    )}
                    Enviar Prueba
                  </button>
                </form>
              </div>
            )}

            {/* Step 3: Broadcast */}
            {previewData && (
              <div className="space-y-3 pt-6 border-t border-white/5">
                <span className="text-[9px] bg-red-950 text-red-500 border border-red-500/20 px-2 py-0.5 rounded font-black tracking-widest uppercase">
                  Paso 3
                </span>
                <h4 className="text-sm font-bold text-white leading-snug">Lanzamiento Masivo</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Envía el boletín definitivo a todos los suscriptores conectados de Brevo.
                </p>
                <button
                  onClick={handleSendCampaign}
                  disabled={isSendingCampaign || isSendingTest}
                  className="w-full h-11 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {isSendingCampaign ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Lanzando Campaña...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Enviar Boletín Masivo
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Preview Frame */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col h-[600px]">
            <h3 className="text-base font-black uppercase tracking-wider text-white border-b border-white/5 pb-3 flex items-center gap-2">
              <Eye size={16} className="text-secondary" />
              Previsualización del Correo
            </h3>

            {previewData ? (
              <div className="flex-1 flex flex-col mt-4 gap-3">
                <div className="bg-slate-900 border border-white/5 p-3 rounded-xl text-xs font-semibold text-white flex items-center gap-2">
                  <span className="text-slate-500">Asunto:</span>
                  <span>{previewData.subject}</span>
                </div>
                <div className="flex-1 bg-white rounded-xl overflow-hidden relative border border-white/10">
                  <iframe
                    title="Newsletter Preview"
                    srcDoc={previewData.html}
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <Mail size={48} className="text-slate-700 animate-bounce mb-3" />
                <p className="text-sm font-bold text-slate-400">No hay boletín compilado en este momento.</p>
                <p className="text-xs text-slate-600 mt-1 max-w-sm">
                  Hace clic en "Compilar Boletín" para generar el contenido dinámico con IA basado en los artículos más recientes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
