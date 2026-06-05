import dayjs from "dayjs"

export const createInitials = (name:string)=>{
    const names = name.split(" ");
    const initials = names.map((n) => n[0]).join("");
    return initials.toUpperCase();
}


export const formatDateLocale = (date: Date): string => dayjs(date).format("MMMM D, YYYY")



export const getGreeting = ()=>{
    const time = dayjs();
    const currentHour = time.hour();
    if(currentHour>5 && currentHour < 12){
        return "Good Morning"
    }
     if(currentHour>12 && currentHour < 17){
        return "Good Afternoon"
    }
     if(currentHour>17 && currentHour < 21){
        return "Good Evening"
    }else{
        return "Good Night"
    }
}
