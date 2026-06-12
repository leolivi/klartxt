import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import LanguageSwitcher from '../languageSwitcher/LanguageSwitcher';
import { FooterDialog } from './FooterDialog';
import { useTabDataContext } from '../../context/useTabDataContext';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { exportTabDataAsCsv } from '@/utils/export';

export function Footer() {
  const context = useTabDataContext();
  const { t } = useTranslation();

  return (
    <footer className='flex justify-between gap-8 p-4 fixed left-0 bottom-0 w-full bg-bg'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='defaultFocus'
            size='icon-sm'
            aria-label={t('footerExportCsv')}
            onClick={() => exportTabDataAsCsv(context)}
          >
            <Download aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side='top'>
          {t('footerExportCsv')}
        </TooltipContent>
      </Tooltip>
      <FooterDialog />
      <LanguageSwitcher />
    </footer>
  );
}
