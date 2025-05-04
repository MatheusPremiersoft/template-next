import { isAxiosError } from 'axios';
import { t } from 'i18next';

interface Props {
  message?: string;
  error?: Error;
  type?: 'error' | 'warn' | 'info' | 'log';
}

const Logger = ({ message, error, type = 'error' }: Props) => {
  if (type === 'error') {
    console.error(message, error);
  }

  if (type === 'warn') {
    console.warn(message, error);
  }

  if (type === 'info') {
    console.info(message, error);
  }

  if (type === 'log') {
    console.log(message, error);
  }

  if (isAxiosError(error)) {
    const message =
      error?.response?.data.details.errors[0].message || error.message;
    return { message };
  }

  return { message: t('Error undefined') };
};

const LoggerError = (name: string, error: any) => {
  console.error(name, error);

  if (isAxiosError(error)) {
    const message =
      error?.response?.data.details.errors[0].message || error.message;
    return { message };
  }

  return { message: t('Error undefined') };
};

export { Logger, LoggerError };
