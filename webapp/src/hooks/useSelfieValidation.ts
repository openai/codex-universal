import { useState } from 'react';

interface SelfieState {
  selfieUrl?: string;
  validated: boolean;
}

export function useSelfieValidation() {
  const [state, setState] = useState<SelfieState>({ validated: false });

  function captureSelfie() {
    const placeholder = `https://api.dicebear.com/8.x/identicon/svg?seed=${Date.now()}`;
    setState({ selfieUrl: placeholder, validated: true });
    return placeholder;
  }

  return { ...state, captureSelfie };
}
