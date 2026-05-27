// Settings sheet — currently just the interpretation lens.
// Soft preference: affects defaults + library ordering, never hides anything.

import { useState } from 'react';
import type { InterpretationMode, MeResponse } from '@afford/shared';
import { ru } from '../i18n/ru';
import { Sheet } from './Sheet';
import { api } from '../api/client';
import { isPreview, previewApi } from '../lib/preview';

const a = () => (isPreview() ? previewApi : api);

const OPTIONS: { key: InterpretationMode; label: string; desc: string }[] = [
  { key: 'permission', label: ru.settings_interp_permission, desc: ru.settings_interp_permission_desc },
  { key: 'effort',     label: ru.settings_interp_effort,     desc: ru.settings_interp_effort_desc     },
  { key: 'both',       label: ru.settings_interp_both,       desc: ru.settings_interp_both_desc       }
];

interface Props {
  me: MeResponse;
  onClose: () => void;
  onUpdate: (me: MeResponse) => void;
}

export function SettingsSheet({ me, onClose, onUpdate }: Props) {
  const current = (me.user.settings.interpretation as InterpretationMode | undefined) ?? 'both';
  const [saving, setSaving] = useState<InterpretationMode | null>(null);

  const pick = async (key: InterpretationMode) => {
    if (saving) return;
    setSaving(key);
    try {
      const next = await a().updateSettings({ interpretation: key });
      onUpdate(next);
    } finally {
      setSaving(null);
    }
  };

  return (
    <Sheet open={true} onClose={onClose} title={ru.settings_title}>
      <div className="form">
        <div className="field">
          <span className="field-label">{ru.settings_interpretation_label}</span>
          <div className="interp-list">
            {OPTIONS.map((o) => (
              <button
                key={o.key}
                type="button"
                className={`interp-card ${current === o.key ? 'active' : ''}`}
                onClick={() => pick(o.key)}
                disabled={saving !== null}
              >
                <span className="interp-card-label">{o.label}</span>
                <span className="interp-card-desc">{o.desc}</span>
              </button>
            ))}
          </div>
          <div className="field-hint muted">{ru.settings_interpretation_hint}</div>
        </div>
      </div>
    </Sheet>
  );
}
