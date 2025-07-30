function formatoFecha(fechaToEdit) {
  let fechaFormateada=''
    if(fechaToEdit.length > 10){
      const fecha = new Date(fechaToEdit)
      let year1 = fecha.getFullYear();
      let month1 = String(fecha.getMonth() + 1).padStart(2, '0');
      let day1 = String(fecha.getDate()).padStart(2, '0');

      fechaFormateada = `${year1}-${month1}-${day1}`;
    }else{
      fechaFormateada = fechaToEdit;
    }


    const [year, month, day] = fechaFormateada.split('-');
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const mes = meses[parseInt(month) - 1];

    return `${day}-${mes}-${year}`;
  }

export { formatoFecha}
