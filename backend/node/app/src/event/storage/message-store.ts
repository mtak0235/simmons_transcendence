import { Injectable } from '@nestjs/common';

export interface Message {
  msg: string;
  from: string;
  to: string;
}
