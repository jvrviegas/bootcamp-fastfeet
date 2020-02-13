import * as Yup from 'yup';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  async index(req, res) {
    // paginação, mostra 20 resultados por página
    const { page = 1 } = req.query; // caso não seja informado o número da página, por padrão será a página 1

    // retorna a lista de agendamento do utlizador que fez a requisição
    const listDeliverymans = await Deliveryman.findAll({
      attributes: ['id', 'name', 'email'],
      limit: 20, // lista somente 20 resultados
      offset: (page - 1) * 20, // serve para determina quantos registos eu quero pular
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });
    return res.json(listDeliverymans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const deliverymanExist = await Deliveryman.findOne({
      where: { email: req.body.email },
    });

    if (deliverymanExist) {
      return res.status(400).json({ error: 'User already exist!' });
    }
    const { id, name, email } = await Deliveryman.create(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      avatar_id: Yup.number().positive(),
    });

    const schemaParamd = Yup.object(req.params).shape({
      id: Yup.number()
        .positive()
        .required(),
    });
    if (
      !(await schema.isValid(req.body)) ||
      !(await schemaParamd.isValid(req.params))
    ) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;
    const { email, avatar_id } = req.body;

    const deliveryman = await Deliveryman.findByPk(id);
    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists.' });
    }
    if (email && email !== deliveryman.email) {
      const checkDeliverymanExists = await Deliveryman.findOne({
        where: { email },
      });

      if (checkDeliverymanExists) {
        return res.status(400).json({ error: 'Deliveryman already exists' });
      }
    }
    if (avatar_id && avatar_id !== deliveryman.avatar_id) {
      const checkIfAvatarExists = await File.findByPk(avatar_id);

      if (!checkIfAvatarExists) {
        return res
          .status(400)
          .json({ error: 'The avatar file does not exists' });
      }
    }

    const { name } = await deliveryman.update(req.body);

    return res.json({
      id,
      name,
      email,
      avatar_id,
    });
  }

  async delete(req, res) {
    const schemaParam = Yup.object(req.params).shape({
      id: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schemaParam.isValid(req.params))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const deliveryman = await Deliveryman.findByPk(req.params.id);
    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists.' });
    }
    try {
      await deliveryman.destroy();
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }

    return res.status(200).json({ message: 'Deliveryman deleted!' });
  }
}
export default new DeliverymanController();
