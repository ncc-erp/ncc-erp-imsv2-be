export interface Ids {
  id: number;
  imsv1EntityId: number;
}

export interface IdMap {
  [key: number]: number;
}

export const mapId = (data: Ids[]) => {
  const obj: IdMap = {};

  data.forEach((element) => {
    obj[element.imsv1EntityId] = element.id;
  });

  return obj;
};

export const generateNewId = (ids: number[]) => {
  let newId = 1;
  while (ids.includes(newId)) newId += 1;
  return newId;
};
