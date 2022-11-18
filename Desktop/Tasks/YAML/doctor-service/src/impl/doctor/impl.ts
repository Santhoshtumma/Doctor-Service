import { Api } from "../../../dist/models";
import * as t from "../../../dist/api/doctors/types";
import * as v from "../../../dist/validation";
import { db } from "../../db";
import doctors from "../../../dist/api/doctors";

export class DoctorService {
    private readonly collectionName: string;

    constructor() {
        this.collectionName = "NEW-DOCTORS";
        this.create = this.create.bind(this);
		this.get = this.get.bind(this);
		this.getAll = this.getAll.bind(this);
		this.put = this.put.bind(this);
		this.delete = this.delete.bind(this);
    }

    async create (request: Api.DoctorDto | undefined) : Promise<t.PostDoctorsCreateResponse> {
        try {
			if (!request) {
				throw new Error("invalid-inputs");
			} 

			if (!request.uId) {
				throw new Error("no-uId-found");
			}

			const doctorRef = db.collection(`${this.collectionName}`).doc(request.uId);
			try {
				await this._checkUserExists(request.uId);
			} catch (error: any) {
				if (error.toString().match("no-doctor-found")) {
					await doctorRef.set({
						...request,
						isExist: true,
						id: doctorRef.id,
						createdAt: new Date().toISOString(),
					});
					return {
						status: 201,
						body: request,
					};
				}
			}
			throw new Error("doctor-already-exists");
		} catch (error: any) {
			console.error(error);
			if (error.toString().match("invalid-inputs")) {
				return {
					status: 422,
					body: {
						message: "Invalid request",
					},
				};
			}

			if (error.toString().match("invalid-inputs")) {
				return {
					status: 422,
					body: {
						message: "No uid found in request",
					},
				};
			}

			if (error.toString().match("doctor-already-exists")) {
				return {
					status: 422,
					body: {
						message: "doctor already exists with given uId",
					},
				};
			}
			throw error;
		}
    }
	async get (id: string) : Promise<t.GetDoctorsGetResponse>{
		try {
			const doctorDocSnap = await db.doc(`${this.collectionName}/${id}`).get();
			if (!doctorDocSnap.exists) {
				throw new Error("no-doctor-found");
			}
			const doctor = v.modelApiDoctorDtoFromJson("doctor", doctorDocSnap.data());
			return {
				status: 200,
				body: doctor,
			};
		} catch (error: any) {
			console.error(error);
			if (error.toString().match("no-doctor-found")) {
				return {
					status: 404,
					body: {
						message: "No doctor found with given id",
					},
				};
			}
			throw error;
		}
	}
	async getAll (limit: number | null | undefined, direction: Api.DirectionParamEnum | undefined, sortByField: string | null | undefined) : Promise<t.GetDoctorsGetAllResponse> {
		try {
			const doctorsQuerySnap = await db.collection(`${this.collectionName}`).get();
			const doctors: Api.DoctorDto[] = doctorsQuerySnap.docs
				.map((doc) => doc.data())
				.map((json) => v.modelApiDoctorDtoFromJson("doctors", json));
			return {
				status: 200,
				body: {
					items: doctors,
					totalCount: doctors.length,
				},
			};
		} catch (error) {
			console.error(error);
			throw error;
		}
	}
	async put (request: Api.DoctorDto | undefined) : Promise<t.PutDoctorsUpdateResponse> {
		try {
			if (!request) {
				throw new Error("invalid-inputs");
			}

			if (!request.uId) {
				throw new Error("no-uId-found");
			}

			const doctorRef = db.collection(`${this.collectionName}`).doc(request.uId);
			const doctorRes = await this._checkUserExists(request.uId);
			await doctorRef.update({
				...request,
				updatedAt: new Date().toISOString(),
			});
			return {
				status: 200,
				body: {
					...doctorRes,
					...request,
				},
			};
		} catch (error: any) {
			console.error(error);
			if (error.toString().match("invalid-inputs")) {
				return {
					status: 422,
					body: {
						message: "Invalid request",
					},
				};
			}

			if (error.toString().match("invalid-inputs")) {
				return {
					status: 422,
					body: {
						message: "No uid found in request",
					},
				};
			}

			throw error;
		}
	}
	async delete (id: string) : Promise<t.DeleteDoctorsDeleteResponse> {
		try {
			await this._checkUserExists(id);
			const doctorRef = db.collection(`${this.collectionName}`).doc(id);
			await doctorRef.delete({
				//isExist: false,
				//deletedAt: new Date().toISOString(),
			});
			return {
				status: 200,
				body: {
					message: "Doctor deleted successfully",
				},
			};
		} catch (error: any) {
			console.error(error);
			if (error?.response?.status === 404) {
				return {
					status: 404,
					body: {
						message: "Doctor already deleted or no patient found",
					},
				};
			}
			throw error;
		}
	}
	private async _checkUserExists(id: string) {
		const response = await this.get(id);
		if (response.status === 404) {
			throw new Error("no-doctor-found");
		}
		return response.body;
	}
}