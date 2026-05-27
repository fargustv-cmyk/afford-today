// Post-purchase check-in (SPEC §7).
// One reaction tap + optional private note. Copy is intentionally neutral —
// no answer is "right" or "wrong", no shame on guilt, no preaching on joy.

import { useState } from 'react';
import type { Feeling } from '@afford/shared';
import { ru } from '../i18n/ru';
import { Sheet } from './Sheet';
import { api } from '../api/client';
import { isPreview, previewApi } from '../lib/preview';

const a = () => (isPreview() ? previewApi : api);

const FEELINGS: { key: Feeling; emoji: string; labelKey: keyof typeof ru }[] = [
  { key: 'zero_guilt', emoji: '😌', labelKey: 'feeling_zero_guilt' },
  { key: 'joy', emoji: '🎉', labelKey: 'feeling_joy' },
  { key: 'scared_but_good', emoji: '😬', labelKey: 'feeling_scared_but_good' },
  { key: 'empty', emoji: '😐', labelKey: 'feeling_empty' },
  { key: 'guilt', emoji: '😔', labelKey: 'feeling_guilt' }
];

interface Props {
  wishId: string;
  onDone: () => void;
}

export function CheckInSheet({ wishId, onDone }: Props) {
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!feeling || saving) return;
    setSaving(true);
    try {
      await a().checkIn(wishId, feeling, note);
      onDone();
    } catch {
      // soft fail — never block the user; close anyway
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={true} onClose={onDone} title={ru.checkin_title}>
      <p className="checkin-sub">{ru.checkin_sub}</p>

      <div className="feeling-grid">
        {FEELINGS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`feeling-btn ${feeling === f.key ? 'active' : ''}`}
            onClick={() => setFeeling(f.key)}
          >
            <span className="feeling-emoji" aria-hidden>{f.emoji}</span>
            <span className="feeling-label">{ru[f.labelKey]}</span>
          </button>
        ))}
      </div>

      <label className="field">
        <span className="field-label">{ru.checkin_note_label}</span>
        <textarea
          className="field-input area"
          placeholder={ru.checkin_note_placeholder}
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      <button
        type="button"
        className="btn-primary"
        onClick={save}
        disabled={!feeling || saving}
      >
        {saving ? '…' : ru.checkin_save}
      </button>
      <button type="button" className="btn-ghost-link" onClick={onDone}>
        {ru.checkin_skip}
      </button>
    </Sheet>
  );
}
