// Settings sheet — interpretation lens + themes (Pro) + Pro CTA.

import { useState } from 'react';
import type { InterpretationMode, MeResponse, ThemeId } from '@afford/shared';
import { ru } from '../i18n/ru';
import { Sheet } from './Sheet';
import { api } from '../api/client';
import { isPreview, previewApi } from '../lib/preview';
import { applyTheme } from '../App';

const a = () => (isPreview() ? previewApi : api);

const OPTIONS: { key: InterpretationMode; label: string; desc: string }[] = [
  { key: 'permission', label: ru.settings_interp_permission, desc: ru.settings_interp_permission_desc },
  { key: 'effort',     label: ru.settings_interp_effort,     desc: ru.settings_interp_effort_desc     },
  { key: 'both',       label: ru.settings_interp_both,       desc: ru.settings_interp_both_desc       }
];

const THEMES: { key: ThemeId; label: string; swatch: string }[] = [
  { key: 'default', label: ru.settings_theme_default, swatch: '#FBF3E7' },
  { key: 'night',   label: ru.settings_theme_night,   swatch: '#1E1A26' },
  { key: 'forest',  label: ru.settings_theme_forest,  swatch: '#EAF1E3' },
  { key: 'paper',   label: ru.settings_theme_paper,   swatch: '#F3EFE6' }
];

interface Props {
  me: MeResponse;
  onClose: () => void;
  onUpdate: (me: MeResponse) => void;
  onOpenPaywall: (reason: string) => void;
}

export function SettingsSheet({ me, onClose, onUpdate, onOpenPaywall }: Props) {
  const current = (me.user.settings.interpretation as InterpretationMode | undefined) ?? 'both';
  const currentTheme = (me.user.settings.theme as ThemeId | undefined) ?? 'default';
  const [saving, setSaving] = useState<string | null>(null);

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

  const pickTheme = async (key: ThemeId) => {
    if (saving) return;
    if (key !== 'default' && !me.unlocked) {
      onOpenPaywall(ru.paywall_reason_theme);
      return;
    }
    setSaving(`theme-${key}`);
    applyTheme(key); // optimistic — paint immediately
    try {
      const next = await a().updateSettings({ theme: key });
      onUpdate(next);
      // Server may snap back to 'default' if Pro check failed there too.
      applyTheme(next.user.settings.theme ?? 'default');
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

        <div className="field">
          <span className="field-label">
            {ru.settings_theme_label}
            {!me.unlocked && <span className="pro-pill">PRO</span>}
          </span>
          <div className="theme-grid">
            {THEMES.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`theme-card ${currentTheme === t.key ? 'active' : ''}`}
                onClick={() => pickTheme(t.key)}
                disabled={saving !== null}
              >
                <span className="theme-swatch" style={{ background: t.swatch }} />
                <span className="theme-label">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {!me.unlocked && (
          <button
            type="button"
            className="claim-btn settings-pro-btn"
            onClick={() => onOpenPaywall(ru.paywall_reason_generic)}
          >
            {ru.settings_unlock_pro}
          </button>
        )}
        {me.unlocked && <div className="muted settings-pro-active">{ru.settings_pro_active}</div>}
      </div>
    </Sheet>
  );
}
