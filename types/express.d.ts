declare global {
  namespace Express {
    interface User {
      id: number; // Augmenting User with id 
    }
  }
}

export {}; // Needed for global augmentation