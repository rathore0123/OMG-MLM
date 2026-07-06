export interface CardHeaderDropDownProps {
  firstItem: string | undefined;
  secondItem: string | undefined;
  thirdItem: string | undefined;
  mainTitle?: string;
}

export interface CardHeaderCommonType {
  title: string;
  borderClass?:boolean,
  subTitle?: string;
  headClass?: string;
  firstItem?: string | undefined;
  secondItem?: string | undefined;
  thirdItem?: string | undefined;
  mainTitle?: string;
  headerClass?: string;
  coupon?:boolean;
  coponcount?:any;
  Openmodal?:any;
  ComponentType?:any;
}

interface SpanType {
  text?: string;
  code?: string;
  mark?: string;
}

export interface CommonCardHeaderProp {
  title: string;
  span?: SpanType[];
  headClass?: string;
  icon?: JSX.Element;
  tagClass?: string;
}
