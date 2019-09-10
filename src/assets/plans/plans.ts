import { Plan } from '@app/interfaces';

import { MauiPlan } from './maui/plan';
import { OahuPlan } from './oahu/plan';
import { BigIslandPlan } from './bigisland/plan';

export const Plans: Plan[] = [ OahuPlan, BigIslandPlan, MauiPlan ];


