function compare( a, b ) {
  if ( a.price < b.price ) {return -1; }
  if ( a.price > b.price ){ return 1; }
  return 0;
}

fetch('https://fuelprice.io/brands/7-eleven/?fuel_type=ulp98', { cache: "force-cache" })
  .then((response) => {
    return response.text();
  })
  .then((html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const fuelTypeAgo = doc.querySelectorAll('.fuel-type-ago');
    const fuelLocation = [];

    for(let fi=0; fi<fuelTypeAgo.length; fi+=1) {
      const fuel = fuelTypeAgo[fi];
      if (
        fuel.textContent.indexOf('mins ago') !== -1
        || fuel.textContent.indexOf('hours ago') !== -1
      ) {
        const container = fuel.closest('li');
        const anchor = container.querySelector('a');
        const location = anchor.textContent;
        const priceAgo = container.textContent.replace(location, '');
        const [price, timeAgo] = priceAgo.split(' ');
        fuelLocation.push({location, price, timeAgo});
      }
    }

    fuelLocation.sort(compare);
    document.getElementById('fuel-price').value = fuelLocation.splice(0,10).map((fuel) => {
      return `$${fuel.price} in ${fuel.location.replace('7-Eleven ', '')} ${fuel.timeAgo}`;
    }).join('\n');
  })
  .catch(function (err) {
    // There was an error
    console.warn('Something went wrong.', err);
  });
