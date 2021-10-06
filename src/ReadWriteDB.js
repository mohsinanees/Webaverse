const axios = require("axios");
const { DB } = require("../config.js");

const limit = 10001;

const readMetadata = async function (id) {
  if (!id || id > limit) {
    throw new Error("Record id out of range");
  }

  let url = `${DB.host}:${DB.port}/${DB.table.metadata}/${id}`;

  try {
    let record = await axios.get(url);
    return record;
  } catch (err) {
    throw err;
  }
};

const readMetadatas = async function (startId, count) {
  if (!startId || !count || startId + count > limit) {
    throw new Error("Record id out of range");
  }

  let records = [];
  let baseUrl = `${DB.host}:${DB.port}/${DB.table.metadata}`;

  for (let i = startId; i <= startId + count; i++) {
    try {
      let url = `${baseUrl}/${i}`;
      let record = await axios.get(url);
      records.push(record);
    } catch (err) {
      throw err;
    }
  }
  return records;
};

const readVoucher = async function (id) {
  if (!id || id > limit) {
    throw Error("Record id out of range");
  }

  let url = `${DB.host}:${DB.port}/${DB.table.voucher}/${id}`;

  try {
    let record = await axios.get(url);
    return record;
  } catch (err) {
    throw err;
  }
};

const readVouchers = async function (startId, count) {
  if (!startId || !count || startId + count > limit) {
    throw new Error("Record id out of range");
  }

  let records = [];
  let baseUrl = `${DB.host}:${DB.port}/${DB.table.vouchers}`;

  for (let i = startId; i <= startId + count; i++) {
    try {
      let url = `${baseUrl}/${i}`;
      let record = await axios.get(url);
      records.push(record);
    } catch (err) {
      throw err;
    }
  }
  return records;
};

const createVoucher = async function (body) {
  if (!startId || !count || startId + count > limit) {
    throw new Error("Record id out of range");
  }

  let url = `${DB.host}:${DB.port}/${DB.table.voucher}`;

  try {
    let record = await axios.post(url, body);
    return record;
  } catch (err) {
    throw err;
  }
};

const createVouchers = async function (startId, count, bodies) {
  if (!startId || !count || startId + count > limit) {
    throw new Error("Record id out of range");
  }

  let records = [];
  let url = `${DB.host}:${DB.port}/${DB.table.vouchers}`;

  for (let i = startId, j = 0; i <= startId + count; i++) {
    try {
      let record = await axios.post(url, bodies[j]);
      records.push(record);
    } catch (err) {
      throw err;
    }
  }
  return records;
};

readMetadata(1);
