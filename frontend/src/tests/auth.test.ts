import authService, { User, LoginCredentials } from '../services/auth';
import api from '../services/api';

// Mock the api module
jest.mock('../services/api');

describe('AuthService', () => {
  const mockUser: User = {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
  };

  const mockToken = 'fake-jwt-token';

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('login', () => {
    test('should store token and user on successful login', async () => {
      const credentials: LoginCredentials = {
        email: 'admin@example.com',
        password: 'password123',
      };

      const mockResponse = {
        data: {
          token: mockToken,
          user: mockUser,
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await authService.login(credentials);

      expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse.data);
      expect(localStorage.getItem('token')).toBe(mockToken);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    });

    test('should throw error on failed login', async () => {
      const credentials: LoginCredentials = {
        email: 'admin@example.com',
        password: 'wrongpassword',
      };

      const mockError = new Error('Invalid credentials');
      (api.post as jest.Mock).mockRejectedValue(mockError);

      await expect(authService.login(credentials)).rejects.toThrow(mockError);
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('logout', () => {
    test('should clear token and user from localStorage', () => {
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    test('should return user from localStorage', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));

      const user = authService.getCurrentUser();

      expect(user).toEqual(mockUser);
    });

    test('should return null if no user in localStorage', () => {
      const user = authService.getCurrentUser();

      expect(user).toBeNull();
    });

    test('should return null if user data is corrupted', () => {
      localStorage.setItem('user', 'invalid-json');

      const user = authService.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('getToken', () => {
    test('should return token from localStorage', () => {
      localStorage.setItem('token', mockToken);

      const token = authService.getToken();

      expect(token).toBe(mockToken);
    });

    test('should return null if no token in localStorage', () => {
      const token = authService.getToken();

      expect(token).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    test('should return true if token exists', () => {
      localStorage.setItem('token', mockToken);

      expect(authService.isAuthenticated()).toBe(true);
    });

    test('should return false if token does not exist', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('hasRole', () => {
    test('should return true if user has the specified role', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));

      expect(authService.hasRole('admin')).toBe(true);
    });

    test('should return false if user does not have the specified role', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));

      expect(authService.hasRole('editor')).toBe(false);
    });

    test('should return false if user is not logged in', () => {
      expect(authService.hasRole('admin')).toBe(false);
    });
  });

  describe('isAdmin', () => {
    test('should return true if user is admin', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));

      expect(authService.isAdmin()).toBe(true);
    });

    test('should return false if user is not admin', () => {
      const editorUser = { ...mockUser, role: 'editor' };
      localStorage.setItem('user', JSON.stringify(editorUser));

      expect(authService.isAdmin()).toBe(false);
    });

    test('should return false if user is not logged in', () => {
      expect(authService.isAdmin()).toBe(false);
    });
  });
});
