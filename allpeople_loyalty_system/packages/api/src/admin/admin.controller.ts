// packages/api/src/admin/admin.controller.ts

import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, ParseIntPipe, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../auth/guards/super-admin.guard';

// --- CAMBIO DEFINITIVO ---
@Controller('super-admin') // Cambiamos la ruta base para evitar conflictos
// --- FIN DEL CAMBIO ---
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('empresas')
  findAllEmpresas() {
    return this.adminService.findAllEmpresas();
  }
  // ... (El resto del archivo se mantiene exactamente igual)
  @Post('empresas')
  crearNuevaEmpresa(@Body() body: { nombre_empresa: string; plan_suscripcion: string; twilio_phone_number?: string; wpp_session_name?: string; whatsapp_provider?: string; }) {
    return this.adminService.crearEmpresa(body.nombre_empresa, body.plan_suscripcion);
  }

  @Post('empresas/:id/crear-admin')
  crearAdminParaEmpresa(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Req() req: any) {
    return this.adminService.crearAdminParaEmpresa(id, body, req.user);
  }

  @Patch('empresas/:id/suspender')
  suspenderEmpresa(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.actualizarEstadoSuscripcion(id, 'suspendida');
  }

  @Patch('empresas/:id/reactivar')
  reactivarEmpresa(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.actualizarEstadoSuscripcion(id, 'activa');
  }

  @Delete('empresas/:id')
  eliminarEmpresa(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.eliminarEmpresa(id);
  }
}