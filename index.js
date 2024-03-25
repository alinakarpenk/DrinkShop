import express from 'express';
import db from "./coctail_db.js"
import Category from "./entity/categories.js"
import Client from "./entity/clients.js"
import CoctailOrder from "./entity/coctail_orders.js"
import Coctail from "./entity/coctails.js"
import IngredientCoctail from "./entity/ingredient_coctails.js"
import Ingredient from "./entity/ingredients.js"
import Order from "./entity/orders.js"
import Status from "./entity/statuses.js"
import { Op } from 'sequelize';
import Sequelize from 'sequelize';
const app = express()
const port = 3000

//Cocktails
app.get('/cocktails', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 5;
  const offset = (page - 1) * perPage;
  Coctail.findAndCountAll({
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'title'],
      },
    ],
    attributes: ['name', 'description', 'volume'],
    limit: perPage,
    offset: offset
  })
    .then(coctails => {
      res.json({
        currentPage: page,
        cocktails: coctails.rows
      });
    })
    .catch(error => {
      console.error('Помилка:', error);
      res.status(500).json({ error: 'Помилка' });
    });
});

app.post('/cocktails/', async (req, res) => {
  try {
    const name = req.query.name;
    const description = req.query.description;
    const volume = req.query.volume;
    const categoryId = req.query.category_id;
    if (!name || !description || !volume || !categoryId) {
      res.json({ error: 'Всі поля повинні бути заповнені' });
      return;
    }
    const createCoctail = await Coctail.create({
      name: name,
      description: description,
      volume: volume,
      category_id: categoryId
    });
    res.json(createCoctail);
  } catch (error) {
    console.error('Помилка під час додавання коктелю:', error);
    res.status(500).json({ error: 'Помилка' });
  }
});

app.delete('/cocktails/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const cocktail = await Coctail.findByPk(id);
    if (cocktail) {
      await cocktail.destroy();
      res.send('Коктель видалено');
    } else {
      res.status(404).send('Коктель не знайдено');
    }
  } catch (error) {
    console.error('Помилка видалення коктелю:', error);
    res.status(500).send('Помилка видалення коктелю');
  }
});

app.put('/cocktails/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description, volume, categoryId } = req.body;
    if (!name || !description || !volume || !categoryId) {
      return res.status(400).json({ error: 'Всі поля повинні бути заповнені' });
    }
    const cocktail = await Coctail.findByPk(id);
    if (cocktail) {
      cocktail.name = name;
      cocktail.description = description;
      cocktail.volume = volume;
      cocktail.categoryId = categoryId;
      await cocktail.save();
      res.json(cocktail);
    } else {
      res.status(404).json({ error: 'Коктель не знайдено' });
    }
  } catch (error) {
    console.error('Помилка:', error);
    res.status(500).json({ error: 'Помилка' });
  }
});


//Ingredient
app.get('/cocktails/ingredient/:id', async (req, res) => {
  const cocktailId = req.params.id;
  try {
    const cocktail = await IngredientCoctail.findAll({
      where: { coctail_id: cocktailId },
      include: [
        {
          model: Ingredient,
          as: 'ingredient'
        }
      ]
    });
    if (!cocktail) {
      return res.json({ error: `Коктель [${cocktail}]  не знайдено` });
    }
    res.json(cocktail);
  } catch (error) {
    console.error('Помилка при отриманні коктеля:', error);
    res.status(500).json({ error: 'Помилка при обробці запиту' });
  }
});

app.get('/ingredients', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 5;
    const offset = (page - 1) * perPage;
    const ingredients = await Ingredient.findAndCountAll({
      limit: perPage,
      offset: offset
    });
    res.json({
      currentPage: page,
      ingredients: ingredients.rows
    });
  } catch (error) {
    console.error('Помилка при отриманні інградієнтів:', error);
    res.status(500).json({ error: 'Помилка при обробці запиту' });
  }
});

app.post('/ingredients/', async (req, res) => {
  try {
    const name = req.query.name;
    const price = req.query.price;
    const newIngr = await Ingredient.create({ name, price });
    res.json(newIngr);
  }
  catch (error) {
    console.error('Помилка створення інградієнтів:', error);
    res.send('Помилка створення інградієнтів');
  }

});

app.put('/ingredient/:id', async (req, res) => {
  const ingredientId = req.params.id;
  const name = req.query.name;
  const price = req.query.price;
  try {
    const ingredient = await Ingredient.findByPk(ingredientId);
    if (!ingredient) {
      return res.status(404).json({ error: 'Інградієнт не знайдений' });
    }
    ingredient.name = name;
    ingredient.price = price;
    await ingredient.save();
    res.json({ message: 'Інформація про інградієнт успішно оновлена' });
  } catch (error) {
    console.error('Помилка при оновленні інформації про інградієнт:', error);
    res.status(500).json({ error: 'Помилка при обробці запиту' });
  }
});

app.delete('/ingredient/:id', async (req, res) => {
  try {
    const id = req.params.id
    const ingredient = await Ingredient.findByPk(id);
    if (ingredient) {
      await ingredient.destroy();
      res.send('Інградієнт видалено');
    } else {
      res.status(404).send('Інградієнт не знайдео');
    }
  } catch (error) {
    console.error('Помилка видалення Інградієнта:', error);
    res.status(500).send('Помилка видалення інградієнта');
  }
});

//IngradientCoctails
app.get('/ingredients/cocktails', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 5;
    const offset = (page - 1) * perPage;
    const ingrcockt = await IngredientCoctail.findAndCountAll({
      limit: perPage,
      offset: offset
    });
    res.json({
      currentPage: page,
      ingrcockt: ingrcockt.rows
    });
  } catch (error) {
    console.error('Помилка при отриманні:', error);
    res.status(500).json({ error: 'Помилка при обробці запиту' });
  }
});

app.post('/ingredient/cocktails', async (req, res) => {
  try {
    const amount = req.query.amount;
    const coctail_id = req.query.coctail_id;
    const ingredient_id = req.query.ingredient_id;
    const ingrcockt = await IngredientCoctail.create({
      amount: amount,
      coctail_id: coctail_id,
      ingredient_id: ingredient_id
    });
    res.json(ingrcockt);
  } catch (error) {
    console.error('Помилка при отриманні:', error);
    res.status(500).json({ error: 'Помилка при обробці запиту' });
  }

});

app.delete('/ingredients/cocktail/:id', async (req, res) => {
  try {
    const ingrcockt = await IngredientCoctail.findByPk(req.params.id);
    if (ingrcockt) {
      await ingrcockt.destroy();
      res.send('Інградієнт коктелю видалено');
    } else {
      res.status(404).send('Інградієнт коктелю не знайдено');
    }
  } catch (error) {
    console.error('Помилка видалення інградієнта коктелю:', error);
    res.status(500).send('Помилка видалення інградієнта коктелю');
  }
});

app.put('/ingredients/cocktails/:id', async (req, res) => {
  const cocktailIngrId = req.params.id;
  const amount = req.query.amount;
  const coctail_id = req.query.coctail_id;
  const ingredient_id = req.query.ingredient_id;
  try {
    const cocktailIngr = await IngredientCoctail.findByPk(cocktailIngrId);
    if (!cocktailIngr) {
      return res.status(404).json({ error: 'Інградієнт не знайдено' });
    }
    cocktailIngrId.amount = amount;
    cocktailIngrId.coctail_id = coctail_id;
    cocktailIngrId.ingredient_id = ingredient_id;
    await cocktailIngrId.save();
    res.json({ message: 'Інформація про інградієнт успішно оновлена' });
  } catch (error) {
    console.error('Помилка при оновленні інформації про інградієнт коктелю коктелю:', error);
    res.status(500).json({ error: 'Помилка при обробці запиту' });
  }
});

//Cocktail Order
app.get('/cocktail/total-price', async (req, res) => {
  try {
    const { cocktail_name } = req.query;
    const totalPrice = await CoctailOrder.findAll({
      attributes: [
        'coctail_id',
        [Sequelize.fn('SUM', Sequelize.col('price')), 'total_price']
      ],
      include: [
        {
          model: Coctail,
          where: { name: cocktail_name },
          attributes: []
        }
      ],
      group: ['coctail_id']
    });
    res.json(totalPrice);
  } catch (error) {
    console.error('Помилка:', error);
    res.status(500).json({ error: 'помилка' });
  }
});

app.get('/coctails/order', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 5;
    const offset = (page - 1) * perPage;
    const coctailsorder = await CoctailOrder.findAndCountAll({
      limit: perPage,
      offset: offset
    });
    res.json({
      currentPage: page,
      coctailsorder: coctailsorder.rows
    });
  } catch (error) {
    console.error('Помилка при отриманні:', error);
    res.status(500).json({ error: 'Помилка при обробці запиту' });
  }
});

app.post('/cocktails/order/', async (req, res) => {
  try {
    const count = req.query.count;
    const price = req.query.price;
    const cocktail_id = req.query.cocktail_id;
    const order_id = req.query.order_id;
    const createCoctailOrder = await CoctailOrder.create({
      count: count,
      price: price,
      cocktail_id: cocktail_id,
      order_id: order_id
    });
    res.json(createCoctailOrder);
  } catch (error) {
    console.error('Помилка під час додавання замовлення коктелю:', error);
    res.status(500).json({ error: 'Помилка' });
  }
});

app.delete('/cocktails/order/:id', async (req, res) => {
  try {
    const cocktail_order = await CoctailOrder.findByPk(req.params.id);
    if (cocktail_order) {
      await cocktail_order.destroy();
      res.send('Замовлення коктелю видалено');
    } else {
      res.status(404).send('Замовлення коктелю не знайдено');
    }
  } catch (error) {
    console.error('Помилка видалення замовлення коктелю:', error);
    res.status(500).send('Помилка видалення замовлення коктелю');
  }
});

app.put('/coctails/order/:id', async (req, res) => {
  const cocktailOrderId = req.params.id;
  const count = req.query.count;
  const price = req.query.price;
  const cocktail_id = req.query.cocktail_id;
  const order_id = req.query.order_id;
  try {
    const cocktailOrder = await Category.findByPk(cocktailOrderId);
    if (!cocktailOrder) {
      return res.status(404).json({ error: 'Замовлення коктелю не знайдено' });
    }
    cocktailOrder.count = count;
    cocktailOrder.price = price;
    cocktailOrder.cocktail_id = cocktail_id;
    cocktailOrder.order_id = order_id;
    await cocktailOrder.save();
    res.json({ message: 'Інформація про замовлення коктелю успішно оновлена' });
  } catch (error) {
    console.error('Помилка при оновленні інформації про замовлення коктелю:', error);
    res.status(500).json({ error: 'Помилка при обробці запиту' });
  }
});


//Order
app.get('/orders', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 5;
    const offset = (page - 1) * perPage;
    const orders = await Order.findAndCountAll({
      limit: perPage,
      offset: offset
    });
    res.json({
      currentPage: page,
      orders: orders.rows
    });
  } catch (error) {
    console.error('Помилка при отриманні замовлень:', error);
    res.status(500).json({ error: 'Помилка при обробці запиту' });
  }
});

app.post('/orders', async (req, res) => {
  const ordering_date = req.query.ordering_date;
  const client_id = req.query.client_id;
  const status_id = req.query.status_id;
  try {
    const newOrder = await Order.create({
      ordering_date: ordering_date,
      client_id: client_id,
      status_id: status_id
    });
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Помилка при додаванні замовлення:', error);
    res.status(500).json({ error: 'Помилка при обробці запиту' });
  }
});

app.put('/orders/:id', async (req, res) => {
  const OrderId = req.params.id;
  const { ordering_date, client_id, status_id } = req.body;
  try {
    const order = await Order.findByPk(OrderId);
    if (!order) {
      return res.status(404).json({ error: 'Замовлення не знайдено' });
    }
    order.ordering_date = ordering_date,
      order.client_id = client_id,
      order.status_id = status_id
    await order.save();
    res.json({ message: 'Замовлення оновлено!' });
  } catch (error) {
    console.error('Помилка при оновленні інформації про замовлення:', error);
    res.status(500).json({ error: 'Помилка при обробці запиту' });
  }
});

app.delete('/cocktails/:cocktailId/orders', async (req, res) => {
  try {
    const cocktailId = req.params.cocktailId;
    const orders = await Order.findAll({ where: { cocktail_id: cocktailId } });
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Orders not found for this cocktail' });
    }
    await Order.destroy({ where: { cocktail_id: cocktailId } });
    res.json({ message: 'Orders deleted successfully' });
  } catch (error) {
    console.error('Error deleting orders:', error);
    res.status(500).json({ error: 'Error deleting orders' });
  }
});

//запит на отриманя статусу замовлення для клієнта
app.get('/clients/orders', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const offset = (page - 1) * perPage;
    const clientsWithOrders = await Order.findAndCountAll({
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'first_name', 'last_name'],
        },
        {
          model: Status,
          as: 'status',
          attributes: ['title'],
        }
      ],
      attributes: ['id', 'ordering_date'],
      limit: perPage,
      offset: offset
    });
    const totalPages = Math.ceil(clientsWithOrders.count / perPage);
    res.json({
      totalItems: clientsWithOrders.count,
      totalPages: totalPages,
      currentPage: page,
      clientsWithOrders: clientsWithOrders.rows
    });
  } catch (error) {
    console.error('Помилка при отриманні клієнтів:', error);
    res.status(500).json({ error: 'Помилка' });
  }
});

//Clients
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
app.post('/client', async (req, res) => {
  try {
    const firstName = req.query.first_name;
    const lastName = req.query.last_name;
    const email = req.query.email;
    const address = req.query.address;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Неправильний формат електронної пошти' });
    }
    const newClient = await Client.create({
      first_name: firstName,
      last_name: lastName,
      email: email,
      address: address
    });
    res.json(newClient);
  } catch (error) {
    console.error('Помилка під час додавання клієнта:', error);
    res.json({ error: 'error' });
  }
});

app.get('/clients', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 5;
    const offset = (page - 1) * perPage;
    const clients = await Client.findAndCountAll({
      limit: perPage,
      offset: offset
    });
    res.json({
      currentPage: page,
      clients: clients.rows
    });
  } catch (error) {
    console.error('Помилка при отриманні клієнтів:', error);
    res.status(500).json({ error: 'Помилка при обробці запиту' });
  }
});

app.delete('/clients/:id', async (req, res) => {
  const clientId = req.params.id;
  try {
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Клієнт не знайдений' });
    }
    await client.destroy();
    res.json({ message: 'Клієнт успішно видалений' });
  } catch (error) {
    console.error('Помилка при видаленні клієнта:', error);
    res.status(500).json({ error: 'Помилка при обробці запиту' });
  }
});

app.put('/clients/:id', async (req, res) => {
  const clientId = req.params.id;
  const { first_name, last_name, email, address } = req.body;
  try {
    const client = await Client.findByPk(clientId);
    if (!client) {
      return res.status(404).json({ error: 'Клієнт не знайдений' });
    }
    client.first_name = first_name;
    client.last_name = last_name;
    client.email = email;
    client.address = address;
    await client.save();
    res.json({ message: 'Інформація про клієнта успішно оновлена' });
  } catch (error) {
    console.error('Помилка при оновленні інформації про клієнта:', error);
    res.status(500).json({ error: 'Помилка при обробці запиту' });
  }
});

//Category
app.get('/categories', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 5;
    const offset = (page - 1) * perPage;
    const categories = await Category.findAndCountAll({
      limit: perPage,
      offset: offset
    });
    res.json({
      currentPage: page,
      categories: categories.rows
    });
  } catch (error) {
    console.error('Помилка при отриманні категорій:', error);
    res.status(500).json({ error: 'Помилка при обробці запиту' });
  }
});

app.get('/categories/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Категорія не знайдена' });
    }
    res.json(category);
  } catch (error) {
    console.error('Помилка при отриманні категорії за ідентифікатором:', error);
    res.status(500).json({ error: 'Помилка при обробці запиту' });
  }
});


app.get('/category/:title', (req, res) => {
  const categoryTitle = req.params.title;
  Category.findOne({ where: { title: categoryTitle } })
    .then(category => {
      if (!category) {
        return res.json({ error: `Категорія [${categoryTitle}] не знайдена` });
      }
      return Coctail.findAll({
        where: { category_id: category.id },
        attributes: ['name', 'description', 'volume']
      });
    })
    .then(coctails => {
      if (!coctails || coctails.length === 0) {
        return res.json({ error: `Коктелі в категорії не знайдені` });
      }
      res.json(coctails);
    })
    .catch(error => {
      console.error('Помилка:', error);
      res.status(500).json({ error: 'Помилка' });
    });
});

app.post('/categories/', async (req, res) => {
  try {
    const title = req.query.title;
    const description = req.query.description;
    const newCateg = await Category.create({ title, description });
    res.json(newCateg);
  }
  catch (error) {
    console.error('Помилка створення категорії:', error);
    res.send('Помилка створення категорії');
  }

});

app.put('/category/:id', async (req, res) => {
  const categoryId = req.params.id;
  const { title, description } = req.body;
  try {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Категорія не знайдений' });
    }
    category.title = title;
    category.description = description;
    await category.save();
    res.json({ message: 'Інформація про категорію успішно оновлена' });
  } catch (error) {
    console.error('Помилка при оновленні інформації про категорію:', error);
    res.status(500).json({ error: 'Помилка при обробці запиту' });
  }
});

app.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (category) {
      await category.destroy();
      res.send('category deleted');
    } else {
      res.status(404).send('category not found');
    }
  } catch (error) {
    console.error('Помилка видалення категорії:', error);
    res.status(500).send('Помилка видалення категорії');
  }
});



app.get('/completed-orders/:title', async (req, res) => {
  try {
    const title = req.params.title
    const completedOrders = await Order.findAll({
      include: [{
        as: 'status',
        model: Status,
        where: { title: title } 
      }]
    });

    res.json(completedOrders);
  } catch (error) {
    console.error('Помилка при отриманні виконаних замовлень:', error);
    res.status(500).json({ error: 'Помилка при обробці запиту' });
  }
});

//await db.sync({ force: true });


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

