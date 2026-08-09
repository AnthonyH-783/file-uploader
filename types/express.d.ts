declare global {
  namespace Express {
    interface User {
      id: string; // Augmenting User with id 
    }
  }
}

export {}; // Needed for global augmentation