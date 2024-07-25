import axios from "axios";

axios.defaults.url = "https://185.197.34.18/";

export const APILogin = async (login: string, password: string) => {
    const res = await axios.post(
        "/graphql",
        `{login(login:${login}, password: ${password})}`
    );
    if (res.status === 200) return res.data;
    return false;
};
