
import * as t from "../../../dist/api/doctors/types";
import { DoctorService } from "./impl";

const service = new DoctorService();

export const DoctorServiceImpl: t.DoctorsApi = {
    postDoctorsCreate: service.create,
    getDoctorsGet: service.get,
    getDoctorsGetAll: service.getAll,
    putDoctorsUpdate: service.put,
    deleteDoctorsDelete: service.delete,
};