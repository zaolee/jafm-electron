// preload.js가 노출하는 Electron IPC 브릿지
interface Window {
  electronAPI: any;
}

// 외부 스크립트(<script src="xlsx.full.min.js">)로 로드되는 전역 라이브러리 선언
declare const XLSX: {
  read: (data: any, opts?: any) => any;
  write: (wb: any, opts?: any) => any;
  writeFile: (wb: any, filename: string, opts?: any) => void;
  utils: {
    book_new: () => any;
    book_append_sheet: (wb: any, ws: any, name: string) => void;
    aoa_to_sheet: (data: any[][]) => any;
    sheet_to_json: (ws: any, opts?: any) => any[];
  };
};
