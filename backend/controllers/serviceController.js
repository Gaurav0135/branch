import Service from "../models/Service.js";

export const createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.json(service);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ _id: -1 }).lean();
    res.json(services);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};