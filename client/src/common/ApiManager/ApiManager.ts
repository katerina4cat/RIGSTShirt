import axios from "axios";

const baseURL = "/api";

export const APILogin = async (login: string, password: string) => {
    try {
        const res = await axios.post(baseURL + "/graphql", {
            query: `{
            login(login:"${login}", password: "${password}")
            }`,
        });
        return res.data;
    } catch (err) {
        return { errors: [{ message: "Не удалось подключиться к серверу" }] };
    }
};

export const APILogOut = async () => {
    try {
        const res = await axios.post(baseURL + "/graphql", {
            query: `{
            logout
            }`,
        });
        return res.data;
    } catch (err) {
        return { errors: [{ message: "Не удалось подключиться к серверу" }] };
    }
};

export const APIAccessTest = async () => {
    try {
        const res = await axios.post(baseURL + "/graphql", {
            query: `{
            hasAccess
            }`,
        });
        return res.data.data.hasAccess;
    } catch (err) {
        return { errors: [{ message: "Не удалось подключиться к серверу" }] };
    }
};
