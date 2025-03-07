import axios from 'axios';

export class UserService {
  private static instance: UserService;
  private static BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async getStudentProfileData(studentId: number) {
    try {
      const response = await axios.get(`${UserService.BASE_URL}/user/student/${studentId}/profile`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student profile data:', error);
      throw error;
    }
  }

  async updateStudentProfileInfo(
    studentId: number, 
    name: string, 
    surname: string, 
    phone: string, 
    location: string, 
    bio: string
  ) {
    try {
      const response = await axios.put(`${UserService.BASE_URL}/user/student/${studentId}/profile`, {
        name,
        surname,
        phone,
        location,
        bio
      });
      return response.data;
    } catch (error) {
      console.error('Error updating student profile info:', error);
      throw error;
    }
  }
}

export default UserService.getInstance();
