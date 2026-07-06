export interface CommonHeaderProjectPropsType {
    title:string,
    number:string
}

export interface HomeEstateDataType {
    color: string;
    icon: string;
    title: string;
    course: string;
    percentage: string;
    value: string;
    imageOne: string;
    imageTwo: string;
    number: number;
}

export interface HomeEstateAvatarsProps {
    data : HomeEstateDataType
}

export interface profileNameProps{
    profileName?:string;
    loadingStatus?:boolean;
}