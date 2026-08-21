import tokenService
    from "../services/token.service";


export default async function deleteFromList(
    url,
    id,
    [state, setState],
    setMessage
) {

    const confirmed =
        window.confirm(
            "¿Seguro que quieres eliminar este anuncio?"
        );


    if (!confirmed) {

        return false;
    }


    const jwt =
        tokenService
            .getLocalAccessToken();


    try {

        const response =
            await fetch(
                url,
                {
                    method: "DELETE",

                    headers: {

                        Authorization:
                            `Bearer ${jwt}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            let message =
                "No se ha podido eliminar el anuncio";


            try {

                const data =
                    await response.json();

                message =
                    data.message ||
                    message;

            } catch (error) {

                // La respuesta puede no contener JSON.
            }


            throw new Error(
                message
            );
        }


        setState(
            state.filter(
                (item) =>
                    item.id !== id
            )
        );


        return true;


    } catch (error) {

        setMessage(
            error.message
        );

        return false;
    }
}