function compare( a, b ) {
  if ( a.price < b.price ) {return -1; }
  if ( a.price > b.price ){ return 1; }
  return 0;
}

(async function() {
  const now = new Date().getTime();
  let fuelLocations = window.localStorage.getItem('fuel_locations');

  if (!fuelLocations || (now - fuelLocations.timestamp > 600000)) {
    fuelLocations = {};

    const html = await fetch('https://fuelprice.io/brands/7-eleven/?fuel_type=ulp98', { cache: "force-cache" }).then((response) => { return response.text(); })
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const fuelTypeAgo = doc.querySelectorAll('.fuel-type-ago');

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
        if (!(state in fuelLocations)) {
          fuelLocations[state] = [];
        }
        const [price, timeAgo] = priceAgo.split(' ');
        fuelLocations[state].push({state, location, price, timeAgo});
      }
    }

    window.localStorage.setItem('fuel_locations', JSON.stringify({ timestamp: new Date().getTime(), data: fuelLocations }));
  } else {
    fuelLocations = JSON.parse(fuelLocations);
  }

  const container = document.getElementById('fuel-prices');

  for (let state in fuelLocations.data) {
    fuelLocations.data[state].sort(compare);
    const stateElement = document.createElement('div');
    stateElement.innerText = state;
    stateElement.classList.add('fuel-state');
    container.appendChild(stateElement);

    fuelLocations.data[state].splice(0, 7).forEach((fuel) => {
      const fuelLocation = fuel.location.replace('7-Eleven ', '');
      const fuelElement = document.createElement('button');
      fuelElement.innerText = `$${fuel.price} in ${fuelLocation} ${fuel.timeAgo}`;
      fuelElement.value = `${fuelLocation}, ${state}`;
      fuelElement.addEventListener('click', async (event) => {
        const results = await provider.search({ query: event.target.value });
        const location = { location: { x: results[0].x, y: results[0].y } };
        searchHandler(location);
        map.flyTo([results[0].y, results[0].x], 15);
      });
      container.appendChild(fuelElement);
    });
  }
}());
