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
    const fuelLocation = {};

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
        const state = fuel.closest('ul').previousElementSibling.id.replace('state-', '').replace(/\-/g, ' ');
        if (!(state in fuelLocation)) {
          fuelLocation[state] = [];
        }
        const [price, timeAgo] = priceAgo.split(' ');
        fuelLocation[state].push({state, location, price, timeAgo});
      }
    }

    let list = '';
    for (state in fuelLocation) {
      fuelLocation[state].sort(compare);
      list += `${state}\n`;
      list += fuelLocation[state].splice(0, 7).map((fuel) => {
        return `$${fuel.price} in ${fuel.location.replace('7-Eleven ', '')} ${fuel.timeAgo}`;
      }).join('\n');
      list += `\n\n`;
    }
    document.getElementById('fuel-price').value = list;
  })
  .catch(function (err) {
    // There was an error
    console.warn('Something went wrong.', err);
  });
