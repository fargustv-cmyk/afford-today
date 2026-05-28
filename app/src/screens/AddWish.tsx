import { useState, useRef } from 'react';
import type { CreateWishInput, InterpretationMode, LifeDomain, WishType } from '@afford/shared';
import { ru } from '../i18n/ru';
import { Sheet } from '../components/Sheet';
import { api } from '../api/client';
import { isPreview, previewApi } from '../lib/preview';

const a = () => (isPreview() ? previewApi : api);

const DOMAINS: { key: LifeDomain; label: string }[] = [
  { key: 'clothes', label: ru.domain_clothes },
  { key: 'leisure', label: ru.domain_leisure },
  { key: 'comfort', label: ru.domain_comfort },
  { key: 'health', label: ru.domain_health },
  { key: 'joy', label: ru.domain_joy },
  { key: 'food', label: ru.domain_food },
  { key: 'other', label: ru.domain_other }
];

interface Props {
  open: boolean;
  wishlistId?: string | null;
  onClose: () => void;
  onCreated: () => void;
}

export function AddWishSheet({ open, wishlistId, onClose, onCreated }: Props) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState<WishType>('want');
  const [domain, setDomain] = useState<LifeDomain>('joy');
  const [interpretation, setInterpretation] = useState<InterpretationMode>('both');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ogStatus, setOgStatus] = useState<'idle' | 'loading' | 'failed'>('idle');
  const [saving, setSaving] = useState(false);
  const ogAbort = useRef<AbortController | null>(null);

  const reset = () => {
    setUrl(''); setTitle(''); setPrice('');
    setType('want'); setDomain('joy'); setInterpretation('both');
    setImageUrl(null); setOgStatus('idle');
  };

  const onUrlBlur = async () => {
    const trimmed = url.trim();
    if (!trimmed || !/^https?:\/\//i.test(trimmed)) return;
    ogAbort.current?.abort();
    ogAbort.current = new AbortController();
    setOgStatus('loading');
    try {
      const og = await a().ogPreview(trimmed);
      if (og.title && !title) setTitle(og.title);
      if (og.imageUrl) setImageUrl(og.imageUrl);
      if (og.price && !price) setPrice(String(Math.round(og.price)));
      setOgStatus(og.title || og.price ? 'idle' : 'failed');
    } catch {
      setOgStatus('failed');
    }
  };

  const onSave = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    const input: CreateWishInput = {
      title: title.trim(),
      price: price ? Number(price.replace(',', '.')) : null,
      sourceUrl: url.trim() || null,
      imageUrl,
      type,
      domain,
      interpretation,
      wishlistId: wishlistId ?? null
    };
    try {
      await a().createWish(input);
      reset();
      onCreated();
    } catch {
      // soft fail — keep form open, user retries
    } finally {
      setSaving(false);
    }
  };

  const isEssential = type === 'essential';

  return (
    <Sheet open={open} onClose={() => { reset(); onClose(); }} title={ru.add_title}>
      <div className="form">
        <label className="field">
          <span className="field-label">{ru.add_url_label}</span>
          <input
            className="field-input"
            type="url"
            inputMode="url"
            placeholder={ru.add_url_placeholder}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={onUrlBlur}
            autoComplete="off"
          />
          {ogStatus === 'loading' && <span className="field-hint">{ru.add_url_loading}</span>}
          {ogStatus === 'failed' && <span className="field-hint muted">{ru.add_url_failed}</span>}
        </label>

        <label className="field">
          <span className="field-label">{ru.add_name_label}</span>
          <input
            className="field-input"
            type="text"
            placeholder={ru.add_name_placeholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoComplete="off"
            required
          />
        </label>

        <label className="field">
          <span className="field-label">{ru.add_price_label}</span>
          <input
            className="field-input"
            type="text"
            inputMode="numeric"
            placeholder={ru.add_price_placeholder}
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/[^\d.,]/g, ''))}
            autoComplete="off"
          />
        </label>

        <div className="field">
          <span className="field-label">{ru.add_type_label}</span>
          <div className="seg seg-3">
            <button
              type="button"
              className={`seg-btn ${type === 'essential' ? 'active' : ''}`}
              onClick={() => setType('essential')}
            >
              {ru.add_type_essential}
            </button>
            <button
              type="button"
              className={`seg-btn ${type === 'need' ? 'active' : ''}`}
              onClick={() => setType('need')}
            >
              {ru.add_type_need}
            </button>
            <button
              type="button"
              className={`seg-btn ${type === 'want' ? 'active' : ''}`}
              onClick={() => setType('want')}
            >
              {ru.add_type_want}
            </button>
          </div>
          {isEssential && <div className="essential-hint">{ru.add_essential_chip}</div>}
        </div>

        <div className="field">
          <span className="field-label">{ru.add_domain_label}</span>
          <div className="chips">
            {DOMAINS.map((d) => (
              <button
                key={d.key}
                type="button"
                className={`chip ${domain === d.key ? 'active' : ''}`}
                onClick={() => setDomain(d.key)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {!isEssential && (
          <div className="field">
            <span className="field-label">{ru.add_interp_label}</span>
            <div className="chips">
              <button
                type="button"
                className={`chip ${interpretation === 'permission' ? 'active' : ''}`}
                onClick={() => setInterpretation('permission')}
              >
                {ru.settings_interp_permission}
              </button>
              <button
                type="button"
                className={`chip ${interpretation === 'effort' ? 'active' : ''}`}
                onClick={() => setInterpretation('effort')}
              >
                {ru.settings_interp_effort}
              </button>
              <button
                type="button"
                className={`chip ${interpretation === 'both' ? 'active' : ''}`}
                onClick={() => setInterpretation('both')}
              >
                {ru.settings_interp_both}
              </button>
            </div>
            <div className="field-hint muted">{ru.add_interp_hint}</div>
          </div>
        )}

        <button
          type="button"
          className="btn-primary"
          onClick={onSave}
          disabled={!title.trim() || saving}
        >
          {saving ? '…' : ru.add_save}
        </button>
      </div>
    </Sheet>
  );
}
