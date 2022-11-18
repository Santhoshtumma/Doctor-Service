import { DoctorsApi } from "../../dist/api/doctors/types";
import { ApiImplementation } from "../../dist/types";
import { DoctorServiceImpl } from "./doctor";

export class ServiceImplementation implements ApiImplementation {
    doctors: DoctorsApi = DoctorServiceImpl;
}