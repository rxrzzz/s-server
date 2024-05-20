import { Handler } from "express";
import { v } from "./roomtype.validators";
import { roomTypeRepository } from "./roomtype.repository";
import { httpstatus } from "../ctx";

const createRoomType: Handler = async (req, res, next) => {
  try {
    const { name, price } = v.createRoomTypeValidator.parse(req.body);
    const roomType = await roomTypeRepository.createRoomType({ name, price });
    return res.status(httpstatus.CREATED).send({ roomType, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const deleteRoomType: Handler = async (req, res, next) => {
  try {
    const { name } = v.roomTypeNameValidator.parse(req.query);
    const deletedRoomType = await roomTypeRepository.deleteRoomType(name);
    return res.status(httpstatus.OK).send({ deletedRoomType, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const updateRoomType: Handler = async (req, res, next) => {
  try {
    const { name: currentName } = v.roomTypeNameValidator.parse(req.query);
    const { newName, price } = v.updateRoomTypeValidator.parse(req.body);
    console.log({ currentName, newName, price });
    const updatedRoomType = await roomTypeRepository.updateRoomType({
      currentName,
      name: newName,
      price,
    });
    return res.status(httpstatus.OK).send({ updatedRoomType, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const listPossibleRoomTypes: Handler = async (req, res, next) => {
  try {
    const roomTypes = await roomTypeRepository.getPossibleRoomTypes();
    return res.status(httpstatus.OK).send({ roomTypes, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const addRoomImageURLSToRoom: Handler = async (req, res, next) => {
  try {
    const { urls, imageFileNames, name } = v.updateRoomTypeImageURLs.parse(
      req.body
    );
    const updatedRoom = await roomTypeRepository.updateRoomType({
      currentName: name,
      roomImageURLS: urls,
      imageFileNames
    });
    return res.status(httpstatus.OK).json({ updatedRoom, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

export const roomTypeHandlers = {
  createRoomType,
  deleteRoomType,
  updateRoomType,
  listPossibleRoomTypes,
  addRoomImageURLSToRoom,
};
