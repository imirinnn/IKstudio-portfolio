import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { scrollToId } from '../utils/scroll';

const EnquiryContext = createContext(null);

/** Lets pricing cards and project dialogs pre-select a package in the contact form. */
export function EnquiryProvider({ children }) {
  const [preset, setPreset] = useState({ package: '', note: '', stamp: 0 });
  const startProject = useCallback((pkg = '', note = '') => {
    setPreset({ package: pkg, note, stamp: Date.now() });
    scrollToId('contact');
  }, []);
  const value = useMemo(() => ({ preset, startProject }), [preset, startProject]);
  return <EnquiryContext.Provider value={value}>{children}</EnquiryContext.Provider>;
}

export const useEnquiry = () => useContext(EnquiryContext);
