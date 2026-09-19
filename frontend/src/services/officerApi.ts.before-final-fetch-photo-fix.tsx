const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5000/api";

export interface Promotion {
  rank: string;
  date: string;
  orderNumber?: string;
  remarks?: string;
}

export interface Officer {
  _id?: string;
  fullName: string;
  photograph?: string;
  rank: string;
  beltNumber?: string;
  employeeId: string;
  department: string;
  designation?: string;
  headquarters?: string;
  district?: string;
  state?: string;
  mobileNumber?: string;
  officialEmail?: string;
  dateOfBirth?: string;
  dateOfJoining?: string;
  promotionHistory?: Promotion[];
  currentPosting?: string;
  previousPosting?: string;
  serviceStatus: "Active" | "Suspended" | "Retired";
  bloodGroup?: string;
  emergencyContact?: string;
  address?: string;
  documents?: string[];
  gender?: "Male" | "Female" | "Other";
  createdAt?: string;
  updatedAt?: string;
}

export interface OfficerListResponse {
  success: boolean;
  data: Officer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getOfficers(
  params: Record<string, string | number | undefined> = {}
): Promise<OfficerListResponse> {
  const query = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== ""
      ) {
        query.append(key, String(value));
      }
    }
  );

  const response = await fetch(
    `${API_BASE_URL}/officers?${query.toString()}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch officers"
    );
  }

  return response.json();
}

export async function getOfficerById(
  id: string
): Promise<Officer> {
  const response = await fetch(
    `${API_BASE_URL}/officers/${id}`
  );

  if (!response.ok) {
    const result = await response.json().catch(
      () => null
    );

    throw new Error(
      result?.message ||
        "Failed to fetch officer"
    );
  }

  const result = await response.json();

  return result.data;
}

export async function createOfficer(
  officer: Partial<Officer>
): Promise<Officer> {
  const response = await fetch(
    `${API_BASE_URL}/officers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(officer),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to create officer"
    );
  }

  return result.data;
}

export async function updateOfficer(
  id: string,
  officer: Partial<Officer>
): Promise<Officer> {
  const response = await fetch(
    `${API_BASE_URL}/officers/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(officer),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to update officer"
    );
  }

  return result.data;
}

export async function deleteOfficer(
  id: string
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/officers/${id}`,
    {
      method: "DELETE",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to delete officer"
    );
  }
}

/* ==========================================
   UPLOAD OFFICER PHOTOGRAPH & DOCUMENTS
========================================== */

export interface OfficerUploadResponse {
  success: boolean;
  message: string;
  data: Officer;
  uploaded: {
    photograph: string | null;
    documents: string[];
  };
}

export async function uploadOfficerFiles(
  id: string,
  photograph?: File,
  documents: File[] = []
): Promise<OfficerUploadResponse> {
  const formData = new FormData();

  if (photograph) {
    formData.append(
      "photograph",
      photograph
    );
  }

  documents.forEach((file) => {
    formData.append(
      "documents",
      file
    );
  });

  const response = await fetch(
    `${API_BASE_URL}/officers/${id}/files`,
    {
      method: "POST",
      body: formData,
    }
  );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to upload officer files"
    );
  }

  return result;
}

/* ==========================================
   ADD PROMOTION
========================================== */

export async function addOfficerPromotion(
  id: string,
  promotion: Promotion
): Promise<Officer> {
  const response = await fetch(
    `${API_BASE_URL}/officers/${id}/promotions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(promotion),
    }
  );

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to add promotion"
    );
  }

  return result.data;
}


export async function deleteOfficerDocument(
  id: string,
  documentIndex: number
): Promise<Officer> {
  const response = await fetch(
    `${API_BASE_URL}/officers/${id}/documents/${documentIndex}`,
    {
      method: "DELETE",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to delete document"
    );
  }

  return result.data;
}


