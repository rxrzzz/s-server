import { Handler } from "express";
import { v } from "./roomtype.validators";
import { roomTypeRepository } from "./roomtype.repository";
import { httpstatus } from "../ctx";
import { DuplicateEntryError, NotFoundError } from "../errors";

import { uploadFilesAndGetLinks } from "./roomtype.helpers";

export async function checkIfRoomTypeExists(name: string) {
  const roomTypeExists = await roomTypeRepository.getRoomTypeDetails(name);
  if (!roomTypeExists) throw new NotFoundError(`Room type does not exist.`);
}

const createRoomType: Handler = async (req, res, next) => {
  try {
    const body = v.createRoomTypeValidator.parse(req.body);
    const roomTypeExists = await roomTypeRepository.getRoomTypeDetails(
      body.name
    );
    if (roomTypeExists)
      throw new DuplicateEntryError(`Room type already exists.`);
    const roomType = await roomTypeRepository.createRoomType(body);
    return res.status(httpstatus.CREATED).send({ roomType, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const uploadImagesForRoomType: Handler = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new NotFoundError(`Room type images are not provided.`);
    }
    const { name, files } = v.roomTypeImageUploadValidator.parse(req.body);
    const { fileLinks, fileNames } = await uploadFilesAndGetLinks(files, name);
    if (fileLinks) {
      await roomTypeRepository.updateRoomType({
        currentName: name,
        imageFileNames: fileNames,
        roomImageURLS: fileLinks,
      });
    }
  } catch (err) {
    next(err);
  }
};

const updateRoomType: Handler = async (req, res, next) => {
  try {
    const { name: currentName } = v.roomTypeNameValidator.parse(req.query);
    const body = v.updateRoomTypeValidator.parse(req.body);
    await checkIfRoomTypeExists(currentName);
    const updatedRoomType = await roomTypeRepository.updateRoomType({
      currentName,
      ...body,
    });
    return res.status(httpstatus.OK).send({ updatedRoomType, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const getRoomTypes: Handler = async (req, res, next) => {
  try {
    const roomTypes = await roomTypeRepository.getRoomTypes();
    return res.status(httpstatus.OK).send({ roomTypes, isSuccess: true });
  } catch (err) {
    next(err);
  }
};
const getRoomTypesForHomePage: Handler = async (req, res, next) => {
  try {
    const roomTypes = await roomTypeRepository.getRoomTypesForHomePage();
    return res.status(httpstatus.OK).send({ roomTypes, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const getRoomTypeDetails: Handler = async (req, res, next) => {
  try {
    const { name } = v.roomTypeNameValidator.parse(req.query);
    console.log(name)
    await checkIfRoomTypeExists(name);
    const roomTypeDetails = await roomTypeRepository.getRoomTypeDetails(name);
    return res.status(httpstatus.OK).json({ roomTypeDetails, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const getRoomsForRoomType: Handler = async (req, res, next) => {
  try {
    const { name } = v.roomTypeNameValidator.parse(req.query);
    await checkIfRoomTypeExists(name);
    const roomsForRoomType = await roomTypeRepository.getRoomsForRoomType(name);
    return res
      .status(httpstatus.OK)
      .json({ roomsForRoomType, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const deleteRoomType: Handler = async (req, res, next) => {
  try {
    const { name } = v.roomTypeNameValidator.parse(req.query);
    await checkIfRoomTypeExists(name);
    const deletedRoomType = await roomTypeRepository.deleteRoomType(name);
    return res.status(httpstatus.OK).send({ deletedRoomType, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

export const roomTypeHandlers = {
  createRoomType,
  deleteRoomType,
  updateRoomType,
  getRoomTypes,
  getRoomTypeDetails,
  uploadImagesForRoomType,
  getRoomsForRoomType,
  getRoomTypesForHomePage,
};
