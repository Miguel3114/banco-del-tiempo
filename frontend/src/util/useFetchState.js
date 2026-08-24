import {
    useEffect,
    useState
} from "react";


export default function useFetchState(
    initial,
    url,
    jwt,
    setMessage
) {

    const [data, setData] =
        useState(initial);


    useEffect(() => {

        if (!url) {
            return;
        }


        let ignore = false;


        fetch(
            url,
            {
                headers: {
                    Authorization:
                        `Bearer ${jwt}`
                }
            }
        )

            .then(async (response) => {

                const json =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        json.message ||
                        "No se han podido cargar los datos"
                    );
                }


                return json;
            })

            .then((json) => {

                if (!ignore) {

                    setData(json);
                }
            })

            .catch((error) => {

                if (!ignore) {

                    setMessage(
                        error.message
                    );
                }
            });


        return () => {

            ignore = true;
        };

    }, [
        url,
        jwt,
        setMessage
    ]);


    return [
        data,
        setData
    ];
}