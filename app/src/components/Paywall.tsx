import { useState } from 'react';
import { ru } from '../i18n/ru';
import { Sheet } from './Sheet';
import { api } from '../api/client';
import { isPreview, previewApi } from '../lib/preview';
import { tg } from '../telegram';

const a = () => (isPreview() ? previewApi : api);

interface Props {
  open: boolean;
  reason?: string; // которая фича привела сюда — для копи
  onClose: () => void;
  onUnlocked?: () => void; // вызывается после успешной покупки (через post-payment refresh)
}

export function PaywallSheet({ open, reason, onClose }: Props) {
  const [working, setWorking] = useState(false);

  const startPurchase = async () => {
    if (working) return;
    setWorking(true);
    try {
      const { url, alreadyPro } = await a().proInvoice();
      if (alreadyPro) {
        onClose();
        return;
      }
      if (!url) return;
      // In Telegram, openInvoice handles the Stars sheet natively.
      if (tg?.openInvoice) {
        tg.openInvoice(url, (status) => {
          // status: 'paid' | 'cancelled' | 'failed' | 'pending'
          if (status === 'paid') {
            if (typeof window !== 'undefined') window.location.reload();
          } else {
            // cancelled / failed / pending — close paywall, keep user's
            // context (no reload). They can re-try if needed.
            onClose();
          }
        });
      } else if (typeof window !== 'undefined') {
        window.open(url, '_blank');
      }
    } catch {
      // soft fail
    } finally {
      setWorking(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title={ru.paywall_title}>
      <p className="paywall-lead">{ru.paywall_lead}</p>
      {reason && <p className="paywall-reason muted">{reason}</p>}

      <ul className="paywall-list">
        <li>
          <span className="paywall-item-title">{ru.paywall_lists_title}</span>
          <span className="paywall-item-desc">{ru.paywall_lists_desc}</span>
        </li>
        <li>
          <span className="paywall-item-title">{ru.paywall_packs_title}</span>
          <span className="paywall-item-desc">{ru.paywall_packs_desc}</span>
        </li>
        <li>
          <span className="paywall-item-title">{ru.paywall_fav_title}</span>
          <span className="paywall-item-desc">{ru.paywall_fav_desc}</span>
        </li>
        <li>
          <span className="paywall-item-title">{ru.paywall_freedom_title}</span>
          <span className="paywall-item-desc">{ru.paywall_freedom_desc}</span>
        </li>
        <li>
          <span className="paywall-item-title">{ru.paywall_themes_title}</span>
          <span className="paywall-item-desc">{ru.paywall_themes_desc}</span>
        </li>
      </ul>

      <button
        type="button"
        className="claim-btn paywall-cta"
        onClick={startPurchase}
        disabled={working}
      >
        {working ? '…' : ru.paywall_cta}
      </button>
      <div className="paywall-foot muted">{ru.paywall_foot}</div>
    </Sheet>
  );
}
