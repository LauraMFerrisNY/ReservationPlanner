const express = require('express')
const app = express();
app.use(express.json());
const {
  client,
  createTables,
  createCustomer,
  createRestaurant,
  createReservation,
  fetchCustomers,
  fetchRestaurants,
  fetchReservations,
  destroyReservation
} = require('./db');

app.get('/api/customers',  async(req, res, next)=> {
  try {
    res.send(await fetchCustomers());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/restaurants',  async(req, res, next)=> {
  try {
    res.send(await fetchRestaurants());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/api/reservations',  async(req, res, next)=> {
  try {
    res.send(await fetchReservations());
  }
  catch(ex){
    next(ex);
  }
});

app.delete('/api/customers/:customer_id/reservations/:id',  async(req, res, next)=> {
  try {
    await destroyReservation({customer_id: req.params.customer_id, id: req.params.id});
    res.sendStatus(204);
  }
  catch(ex){
    next(ex);
  }
});

app.post('/api/customers/:customer_id/reservations',  async(req, res, next)=> {
  try {
    res.status(201).send(await createReservation({ customer_id: req.params.customer_id, restaurant_id: req.body.restaurant_id, date: req.body.date, party_count: req.body.party_count}));
  }
  catch(ex){
    next(ex);
  }
});

app.use((err, req, res, next)=> {
  res.status(err.status || 500).send({ error: err.message || err});
});
const init = async()=> {
  console.log('connecting to database');
  await client.connect();
  console.log('connected to database');
  await createTables();
  console.log('created tables');
  const [ron, jill, lila, ethan, adelitas, champs, applebees] = await Promise.all([
    createCustomer({ name: 'Ron'}),
    createCustomer({ name: 'Jill'}),
    createCustomer({ name: 'Lila'}),
    createCustomer({ name: 'Ethan'}),
    createRestaurant({ name: 'Adelitas'}),
    createRestaurant({ name: 'Champs'}),
    createRestaurant({ name: 'Applebees'}),
  ]);
  
  const [reservation, reservation2] = await Promise.all([
    createReservation({
      customer_id: ron.id,
      restaurant_id: adelitas.id,
      date: '02/14/2024',
      party_count: 4
    }),
    createReservation({
      customer_id: lila.id,
      restaurant_id: applebees.id,
      date: '02/28/2024',
      party_count: 2
    }),
  ]);
  
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`))
  
};

init();                    