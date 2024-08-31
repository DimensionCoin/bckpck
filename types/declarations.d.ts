declare module "react-qr-scanner" {
  import * as React from "react";

  interface QrScannerProps {
    onScan: (data: any) => void;
    onError: (error: any) => void;
    style?: React.CSSProperties;
    delay?: number;
    facingMode?: "user" | "environment";
  }

  const QrScanner: React.FC<QrScannerProps>;

  export default QrScanner;
}
