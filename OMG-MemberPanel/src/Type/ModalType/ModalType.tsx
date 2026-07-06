export interface CommonModalType {
    children?: React.ReactNode;
    size?: string;
    isOpen?: boolean;
    toggle?: () => void;
    title?: string;
    modalBodyClassName?: string;
    modalTitleClassName?: string;
    heading?: string;
    sizeTitle?: string;
    fullTitle?: string;
    staticTitle?: string;
    fullscreen?: true | "sm" | "md" | "lg" | "xl" | "xxl";
    centered?: boolean;
    onClosed?: () => void;
    backdrop?: boolean | "static";
  }