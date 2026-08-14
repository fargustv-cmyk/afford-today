import { useRef, useState } from 'react';
import type { CreateWishInput, LifeDomain, WishIntent } from '@afford/shared';
import { ru } from '../i18n/ru';
import { Sheet } from '../components/Sheet';
import { api } from '../api/client';
import { isPreview, previewApi } from '../lib/preview';

const a = () => (isPreview() ? previewApi : api);

interface Props {
  open: boolean;
  wishlistId?: string | null;
  onClose: () => void;
  onCreated: (id?: string) => void;
}

function inferDomain(title: string): LifeDomain {
  const value = title.toLowerCase();
  if (/одеж|обув|кроссов|пальто|куртк|плать|рубаш|джинс/.test(value)) return 'clothes';
  if (/врач|лекар|здоров|массаж|спорт|зал|стомат|витамин/.test(value)) return 'health';
  if (/кофемаш|кофевар/.test(value)) return 'comfort';
  if (/кофе|еда|ресторан|ужин|обед|завтрак|десерт/.test(value)) return 'food';
  if (/книг|кино|концерт|билет|игр|отпуск|путешеств/.test(value)) return 'leisure';
  if (/дом|кресл|диван|плед|наушник|техник|ноутбук|телефон/.test(value)) return 'comfort';
  if (/цвет|подар|украшен|парфюм|хобби/.test(value)) return 'joy';
  return 'other';
}

function inferIntentKind(title: string): WishIntent {
  const value = title.trim().toLowerCase();
  if (/^(купить|заказать|приобрести|взять себе)/.test(value)) return 'purchase';
  if (
    /^(?:хочу\s+)?(полежать|отдохнуть|поспать|погулять|почитать|посмотреть|поиграть|побыть|помолчать|посидеть|порисовать|потанцевать|поплакать|сходить|уйти|взять отгул|взять выходной|не работать|ничего не делать|сказать нет|отказаться|дать себе|устроить себе)/.test(value)
  ) {
    return 'action';
  }
  return 'purchase';
}

export function AddWishSheet({ open, wishlistId, onClose, onCreated }: Props) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [intentKind, setIntentKind] = useState<WishIntent>('purchase');
  const [intentTouched, setIntentTouched] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ogStatus, setOgStatus] = useState<'idle' | 'loading' | 'failed'>('idle');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSeq = useRef(0);

  const reset = () => {
    setUrl('');
    setTitle('');
    setPrice('');
    setIntentKind('purchase');
    setIntentTouched(false);
    setImageUrl(null);
    setOgStatus('idle');
    setError(null);
  };

  const onUrlBlur = async () => {
    const trimmed = url.trim();
    if (!trimmed || !/^https?:\/\//i.test(trimmed)) return;
    const seq = ++requestSeq.current;
    setOgStatus('loading');
    try {
      const og = await a().ogPreview(trimmed);
      if (seq !== requestSeq.current) return;
      if (og.title && !title) setTitle(og.title);
      if (og.imageUrl) setImageUrl(og.imageUrl);
      if (og.price && !price) setPrice(String(Math.round(og.price)));
      setOgStatus(og.title || og.price || og.imageUrl ? 'idle' : 'failed');
    } catch {
      if (seq === requestSeq.current) setOgStatus('failed');
    }
  };

  const onSave = async () => {
    const cleanTitle = title.trim();
    if (!cleanTitle || saving) return;
    setSaving(true);
    setError(null);
    const parsedPrice = price ? Number(price.replace(/\s/g, '').replace(',', '.')) : null;
    const input: CreateWishInput = {
      title: cleanTitle,
      intentKind,
      price: intentKind === 'purchase' && parsedPrice && parsedPrice > 0 ? parsedPrice : null,
      sourceUrl: intentKind === 'purchase' ? url.trim() || null : null,
      imageUrl: intentKind === 'purchase' ? imageUrl : null,
      type: 'want',
      domain: inferDomain(cleanTitle),
      interpretation: 'permission',
      wishlistId: wishlistId ?? null
    };
    try {
      const { wish } = await a().createWish(input);
      reset();
      onCreated(wish.id);
    } catch {
      setError('не получилось сохранить. попробуй ещё раз.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onClose={() => { reset(); onClose(); }} title={ru.add_title}>
      <div className="intent-picker" role="group" aria-label="что ты хочешь себе">
        <button
          type="button"
          aria-pressed={intentKind === 'purchase'}
          className={intentKind === 'purchase' ? 'active' : ''}
          onClick={() => { setIntentKind('purchase'); setIntentTouched(true); }}
        >
          <span aria-hidden>🛍</span>
          <strong>покупку</strong>
          <small>вещь или услугу</small>
        </button>
        <button
          type="button"
          aria-pressed={intentKind === 'action'}
          className={intentKind === 'action' ? 'active' : ''}
          onClick={() => { setIntentKind('action'); setIntentTouched(true); }}
        >
          <span aria-hidden>☁</span>
          <strong>время для себя</strong>
          <small>отдых или действие</small>
        </button>
      </div>

      <p className="add-lead">
        {intentKind === 'purchase'
          ? 'Вещь и цена — больше ничего обязательного.'
          : 'Напиши, что хочешь себе разрешить. Например: полежать 15 минут без вины.'}
      </p>

      <div className="form">
        {intentKind === 'purchase' && (
          <label className="field">
            <span className="field-label">{ru.add_url_label}</span>
            <input
              className="field-input"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (!intentTouched && e.target.value.trim()) setIntentKind('purchase');
              }}
              onBlur={onUrlBlur}
              placeholder={ru.add_url_placeholder}
              inputMode="url"
            />
            {ogStatus === 'loading' && <span className="field-hint muted">{ru.add_url_loading}</span>}
            {ogStatus === 'failed' && <span className="field-hint">{ru.add_url_failed}</span>}
          </label>
        )}

        <label className="field">
          <span className="field-label">{intentKind === 'purchase' ? ru.add_name_label : 'что хочешь сделать?'}</span>
          <input
            className="field-input"
            type="text"
            value={title}
            onChange={(e) => {
              const next = e.target.value;
              setTitle(next);
              if (!intentTouched && !url.trim() && !price.trim()) setIntentKind(inferIntentKind(next));
            }}
            placeholder={intentKind === 'purchase' ? 'например, наушники' : 'например, полежать 15 минут без вины'}
            autoFocus
          />
        </label>

        {intentKind === 'purchase' && (
          <label className="field">
            <span className="field-label">{ru.add_price_label}</span>
            <div className="price-field">
              <input
                className="field-input"
                type="text"
                inputMode="decimal"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value.replace(/[^\d\s.,]/g, ''));
                  if (!intentTouched && e.target.value.trim()) setIntentKind('purchase');
                }}
                placeholder={ru.add_price_placeholder}
              />
              <span>₽</span>
            </div>
          </label>
        )}

        {imageUrl && (
          <div className="add-preview">
            <img src={imageUrl} alt="" />
            <span>картинка подтянулась</span>
          </div>
        )}

        {error && <div className="form-error" role="alert">{error}</div>}

        <button
          type="button"
          className="btn-primary"
          onClick={onSave}
          disabled={!title.trim() || saving}
        >
          {saving ? 'сохраняю…' : ru.add_save}
        </button>
      </div>
    </Sheet>
  );
}
