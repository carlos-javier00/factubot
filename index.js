const files = [
    "1.pdf", 
    "1.xml",
    "2.pdf",
    "2.xml",
    "3.pdf",
    "3.xml",
    "4.pdf",
    "4.xml",
    "5.pdf",
]

const clasificar = (files) => {
    //esta funcion va a retornar grupos de archivos del mismo nombre.
    //cada grupo debe conterner un archivo pdf y un archivo xml
    //si contiene ambos archivos vamos a agregar un valor de true a la propiedad "completo"
    //si no contiene ambos archivos vamos a agregar un valor de false a la propiedad "completo"

    const grupos = []

    for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const nombre = file.split(".")[0]
        const extension = file.split(".")[1]

        const grupo = grupos.find(grupo => grupo.nombre === nombre)

        if (grupo) {
            if (extension === "pdf") {
                grupo.pdf = file
            } else {
                grupo.xml = file
            }
        } else {
            grupos.push({
                nombre,
                [extension]: file
            })
        }
    }

    return grupos.map(grupo => {
        grupo.completo = grupo.pdf && grupo.xml ? true : false
        return grupo
    })
}

console.log(clasificar(files))