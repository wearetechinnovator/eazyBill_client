import Cookies from 'js-cookie';

const useApi = () => {
  const getApiData = async (model, id, barCode) => {
    let payload = { token: Cookies.get("token") };
    if (id) {
      payload = { ...payload, id };
    }
    if (barCode) {
      payload = { ...payload, barCode };
    }

    try {
      let route = 'get';
      if(model === 'party-contacts'){
        route = 'get-all';
      }

      const url = process.env.REACT_APP_API_URL + `/${model}/${route}`;
      const req = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const res = await req.json();
      return res;

    } catch (error) {
      return error;
    }
  }


  return { getApiData };
}

export default useApi;