import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../languageSwitcher/LanguageSwitcher';
import { FooterDialog } from './FooterDialog';

interface FooterProps {
  scanDuration: number | null;
}

export function Footer({ scanDuration }: FooterProps) {
  const { t } = useTranslation();

  return (
    <div className='flex justify-between items-center gap-4 p-4'>
      <p className='text-small'>
        {scanDuration != null ? t('footerScannedIn', { seconds: scanDuration }) : '—'}
      </p>
      <FooterDialog />
      <LanguageSwitcher />
    </div>
  );
}
