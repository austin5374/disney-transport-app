import React, { useEffect, useState } from 'react';
import { Modal, ModalProps, Platform, View, StyleSheet } from 'react-native';

// Native RN's <Modal> always portals to document.body on web (react-native-web
// has no option to change this), so a Modal opened from inside the centered
// desktop frame in App.tsx would cover the entire browser window instead of
// just the frame. This swaps in a manual portal targeting the frame's own
// DOM node on web, and falls back to the real Modal on native untouched.
export const MODAL_HOST_ID = 'app-modal-host';

let ReactDOM: { createPortal: (children: React.ReactNode, container: Element) => React.ReactPortal } | null = null;
if (Platform.OS === 'web') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ReactDOM = require('react-dom');
}

interface AppModalProps extends ModalProps {
  children: React.ReactNode;
}

export default function AppModal({ children, visible = true, ...rest }: AppModalProps) {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && visible) {
      setHost(document.getElementById(MODAL_HOST_ID));
    }
  }, [visible]);

  if (Platform.OS !== 'web') {
    return (
      <Modal visible={visible} {...rest}>
        {children}
      </Modal>
    );
  }

  if (!visible || !host || !ReactDOM) return null;

  return ReactDOM.createPortal(
    <View style={styles.overlay}>{children}</View>,
    host
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
});
