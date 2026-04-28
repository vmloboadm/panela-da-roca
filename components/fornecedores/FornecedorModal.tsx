'use client'

import { useState, useEffect } from 'react'
import { Fornecedor, TipoFornecedor } from '@/types'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Select } from '@/components/ui'
import { saveFornecedor, updateFornecedor } from '@/lib/services/fornecedores'

const TIPOS: TipoFornecedor[] = ['supermercado', 'atacado', 'frigorífico', 'açougue', 'hortifruti']

interface FornecedorModalProps {
  fornecedor: Fornecedor | null  // null = add mode
  onClose: () => void
  onSaved: () => void
}

type FormData = {
  nome: string
  tipo: TipoFornecedor
  bairro: string
  distancia_km: string
  instagram_url: string
  site_url: string
  whatsapp: string
  cor: string
  observacoes: string
  ativo: boolean
}

const EMPTY_FORM: FormData = {
  nome: '',
  tipo: 'supermercado',
  bairro: '',
  distancia_km: '0',
  instagram_url: '',
  site_url: '',
  whatsapp: '',
  cor: '#f4a261',
  observacoes: '',
  ativo: true,
}

export function FornecedorModal({ fornecedor, onClose, onSaved }: FornecedorModalProps) {
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')

  const isEditing = fornecedor !== null

  useEffect(() => {
    if (fornecedor) {
      setForm({
        nome: fornecedor.nome,
        tipo: fornecedor.tipo,
        bairro: fornecedor.bairro,
        distancia_km: String(fornecedor.distancia_km),
        instagram_url: fornecedor.instagram_url ?? '',
        site_url: fornecedor.site_url ?? '',
        whatsapp: fornecedor.whatsapp ?? '',
        cor: fornecedor.cor,
        observacoes: fornecedor.observacoes ?? '',
        ativo: fornecedor.ativo,
      })
    } else {
      setForm(EMPTY_FORM)
    }
    setConfirmDelete(false)
    setError('')
  }, [fornecedor])

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!form.nome.trim()) {
      setError('O nome é obrigatório.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const data: Omit<Fornecedor, 'id'> = {
        nome: form.nome.trim(),
        tipo: form.tipo,
        bairro: form.bairro.trim(),
        distancia_km: parseFloat(form.distancia_km) || 0,
        instagram_url: form.instagram_url.trim() || undefined,
        site_url: form.site_url.trim() || undefined,
        whatsapp: form.whatsapp.trim() || undefined,
        cor: form.cor,
        observacoes: form.observacoes.trim() || undefined,
        ativo: form.ativo,
      }
      if (isEditing && fornecedor) {
        await updateFornecedor(fornecedor.id, data)
      } else {
        await saveFornecedor(data)
      }
      onSaved()
    } catch (e) {
      setError('Erro ao salvar. Tente novamente.')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!fornecedor) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setSaving(true)
    try {
      await updateFornecedor(fornecedor.id, { ativo: false })
      onSaved()
    } catch (e) {
      setError('Erro ao desativar. Tente novamente.')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        {/* Title */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-text-primary font-bold text-[17px]">
            {isEditing ? '✏️ Editar Fornecedor' : '➕ Novo Fornecedor'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          {/* Nome */}
          <div>
            <label className="block text-text-muted text-[12px] font-bold mb-1.5 uppercase tracking-wide">
              Nome <span className="text-danger">*</span>
            </label>
            <Input
              value={form.nome}
              onChange={e => setField('nome', e.target.value)}
              placeholder="Nome do fornecedor"
            />
          </div>

          {/* Tipo + Cor row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-text-muted text-[12px] font-bold mb-1.5 uppercase tracking-wide">
                Tipo
              </label>
              <Select
                value={form.tipo}
                onChange={e => setField('tipo', e.target.value as TipoFornecedor)}
              >
                {TIPOS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-text-muted text-[12px] font-bold mb-1.5 uppercase tracking-wide">
                Cor
              </label>
              <input
                type="color"
                value={form.cor}
                onChange={e => setField('cor', e.target.value)}
                className="w-12 h-[42px] rounded-lg border border-border cursor-pointer bg-white"
                title="Escolher cor"
              />
            </div>
          </div>

          {/* Bairro + Distância row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-text-muted text-[12px] font-bold mb-1.5 uppercase tracking-wide">
                Bairro
              </label>
              <Input
                value={form.bairro}
                onChange={e => setField('bairro', e.target.value)}
                placeholder="Bairro"
              />
            </div>
            <div className="w-32">
              <label className="block text-text-muted text-[12px] font-bold mb-1.5 uppercase tracking-wide">
                Distância (km)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.distancia_km}
                onChange={e => setField('distancia_km', e.target.value)}
              />
            </div>
          </div>

          {/* Instagram */}
          <div>
            <label className="block text-text-muted text-[12px] font-bold mb-1.5 uppercase tracking-wide">
              Instagram URL
            </label>
            <Input
              value={form.instagram_url}
              onChange={e => setField('instagram_url', e.target.value)}
              placeholder="https://www.instagram.com/..."
            />
          </div>

          {/* Site */}
          <div>
            <label className="block text-text-muted text-[12px] font-bold mb-1.5 uppercase tracking-wide">
              Site URL
            </label>
            <Input
              value={form.site_url}
              onChange={e => setField('site_url', e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-text-muted text-[12px] font-bold mb-1.5 uppercase tracking-wide">
              WhatsApp
            </label>
            <Input
              value={form.whatsapp}
              onChange={e => setField('whatsapp', e.target.value)}
              placeholder="+55 22 99999-9999"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-text-muted text-[12px] font-bold mb-1.5 uppercase tracking-wide">
              Observações
            </label>
            <textarea
              value={form.observacoes}
              onChange={e => setField('observacoes', e.target.value)}
              rows={3}
              placeholder="Observações opcionais..."
              className="bg-white border border-border rounded-lg px-[13px] py-[10px] text-text-primary text-[13px] outline-none font-sans w-full focus:border-border-focus transition-colors resize-none"
            />
          </div>

          {/* Ativo toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setField('ativo', !form.ativo)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                form.ativo ? 'bg-success' : 'bg-border'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  form.ativo ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
            <span className="text-text-secondary text-[13px] font-bold">
              {form.ativo ? 'Ativo' : 'Inativo'}
            </span>
          </div>

          {/* Error */}
          {error && (
            <p className="text-danger text-[12px] font-bold">{error}</p>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border gap-3">
          <div>
            {isEditing && (
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={saving}
              >
                {confirmDelete ? '⚠️ Confirmar exclusão' : '🗑️ Desativar'}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : isEditing ? 'Salvar' : 'Adicionar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
