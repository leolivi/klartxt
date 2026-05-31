import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../languageSwitcher/LanguageSwitcher';
import { FooterDialog } from './FooterDialog';
import { useTabDataContext } from '../../context/useTabDataContext';

export function Footer() {
  const { scanDuration } = useTabDataContext();
  const { t } = useTranslation();

  return (
    <div className='flex justify-between items-center gap-4 p-4 fixed left-0 bottom-0 w-full bg-bg'>
      <p className='text-small'>
        {scanDuration != null ? t('footerScannedIn', { seconds: scanDuration }) : '—'}
      </p>
      <FooterDialog />
      <LanguageSwitcher />
    </div>
  );
}
