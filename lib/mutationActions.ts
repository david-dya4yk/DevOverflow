'use server';

import { signOut } from '@/auth';

export async function actionSignOut() {
  await signOut();
}
//  delete this file
