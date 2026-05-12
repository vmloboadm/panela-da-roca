'use client'

import { useState } from 'react'
import { Representante } from '@/types'
import { createRepresentante, updateRepresentante } from '@/lib/services/representantes'

interface RepresentanteModalProps {
  representante: Representante | null  // null = create mode
  onClose: () => void
  onSaved: () => void
}

const EMPTY_FORM = {
  empresa: '',
  nome: '',
  telefone: '',
  whatsapp: '',
  email: '',
  observacoes: '',
  ativo: true,
}

export function RepresentanteModal({ representante, onClose, onSaved }: RepresentanteModalProps) {
  const isEdit = representante !== null
  const [form, setForm] = useState(
    isEdit
      ? {
          empresa:     representante.empresa,
          nome:        representante.nome        ?? '',
          telefone:    representante.telefone    ?? '',
          whatsapp:    representante.whatsapp    ?? '',
          email:       representante.email       ?? '',
          observacoes: representante.observacoes ?? '',
          ativo:       representante.ativo,
        }
      : { ...EMPTY_FORM },
  )
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const set = (field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }))

  async function handleSave() {
    if (!form.empresa.trim()) { setErro('Nome da empresa é obrigatório'); return }
    setSalvando(true)
    setErro(null)
    try {
      const payload = {
        empresa:     form.empresa.trim(),
        nome:        form.nome.trim()        || undefined,
        telefone:    form.telefone.trim()    || undefined,
        whatsapp:    form.whatsapp.trim()    || undefined,
        email:       form.email.trim()       || undefined,
        observacoes: form.observacoes.trim() || undefined,
        ativo:       form.ativo,
      }
      if (isEdit) {
        await updateRepresentante(representante.id, payload)
      } else {
        await createRepresentante(payload)
      }
      onSaved()
      onClose()
    } catch (e) {
      setErro('Erro ao salvar. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleArchivar() {
    if (!isEdit) return
    setSalvando(true)
    try {
      await updateRepresentante(representante.id, { ativo: !representante.ativo })
      onSaved()
      onClose()
    } catch (e) {
      setErro('Erro ao arquivar.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-bg-card border border-border rounded-2xl shadow-elevated w-full max-w-md p-6 flex flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-text-primary font-bold text-base">
          {isEdit ? 'Editar Representante' : 'Novo Representante'}
        </h2>

        {erro && <p className="text-danger text-sm">{erro}</p>}

        {/* Empresa (required) */}
        <div className="flex flex-col gap-1">
          <label className="text-text-secondary text-xs font-medium">Empresa *</label>
          <input
            value={form.empresa}
            onChange={e => set('empresa', e.target.value)}
            placeholder="Ex: Minerva Foods"
            className="bg-bg-base border border-border rounded-xl px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-brand"
          />
        </div>

        {/* Nome do representante */}
        <div className="flex flex-col gap-1">
          <label className="text-text-secondary text-xs font-medium">Nome do representante</label>
          <input
            value={form.nome}
            onChange={e => set('nome', e.target.value)}
            placeholder="Ex: Carlos Silva"
            className="bg-bg-base border border-border rounded-xl px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-brand"
          />
        </div>

        {/* Telefone + WhatsApp */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-text-secondary text-xs font-medium">Telefone</label>
            <input
              value={form.telefone}
              onChange={e => set('telefone', e.target.value)}
              placeholder="(xx) xxxx-xxxx"
              className="bg-bg-base border border-border rounded-xl px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-brand"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-text-secondary text-xs font-medium">WhatsApp</label>
            <input
              value={form.whatsapp}
              onChange={e => set('whatsapp', e.target.value)}
              placeholder="(xx) 9xxxx-xxxx"
              className="bg-bg-base border border-border rounded-xl px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-brand"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-text-secondary text-xs font-medium">Email</label>
          <input
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="representante@empresa.com"
            type="email"
            className="bg-bg-base border border-border rounded-xl px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-brand"
          />
        </div>

        {/* Observações */}
        <div className="flex flex-col gap-1">
          <label className="text-text-secondary text-xs font-medium">Observações</label>
          <textarea
            value={form.observacoes}
            onChange={e => set('observacoes', e.target.value)}
            rows={2}
            className="bg-bg-base border border-border rounded-xl px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-brand resize-none"
          />
        </div>

        {/* Ativo checkbox */}
        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={form.ativo}
            onChange={e => set('ativo', e.target.checked)}
            className="accent-brand"
          />
          Ativo
        </label>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-border rounded-xl text-text-secondary text-sm hover:bg-bg-hover transition-colors"
          >
            Cancelar
          </button>
          {isEdit && (
            <button
              onClick={handleArchivar}
              disabled={salvando}
              className="py-2 px-4 border border-border rounded-xl text-text-muted text-sm hover:bg-bg-hover transition-colors disabled:opacity-40"
            >
              {representante.ativo ? 'Arquivar' : 'Reativar'}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={salvando}
            className="flex-1 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40"
          >
            {salvando ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
